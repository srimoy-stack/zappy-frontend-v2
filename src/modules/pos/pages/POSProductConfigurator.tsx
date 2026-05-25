'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { mockPOSProducts } from '../mock/posData';
import { POSCartPanel } from '../components/POSCartPanel';
import { ConfiguratorSidebar } from './configurator/ConfiguratorSidebar';
import { PortionSelector } from './configurator/PortionSelector';
import { SizeCrustView, SauceCheeseView, ToppingsView, DipsDrinksView } from './configurator/ContentViews';
import { CategoryView, AddOnSelection, PizzaConfig } from './configurator/types';
import '../styles/pos-rush.css';

// ─── Topping category data (3 categories × 16 items each) ──────
const veggieToppings = [
    { id: 'vt1', name: 'Mushrooms', price: 1.50 },
    { id: 'vt2', name: 'Onions', price: 1.00 },
    { id: 'vt3', name: 'Green Peppers', price: 1.00 },
    { id: 'vt4', name: 'Black Olives', price: 1.50 },
    { id: 'vt5', name: 'Tomatoes', price: 1.00 },
    { id: 'vt6', name: 'Jalapeños', price: 1.50 },
    { id: 'vt7', name: 'Spinach', price: 1.50 },
    { id: 'vt8', name: 'Sweet Corn', price: 1.00 },
    { id: 'vt9', name: 'Red Onions', price: 1.00 },
    { id: 'vt10', name: 'Roasted Garlic', price: 1.50 },
    { id: 'vt11', name: 'Artichoke', price: 2.00 },
    { id: 'vt12', name: 'Sun-Dried Tomato', price: 2.00 },
    { id: 'vt13', name: 'Pineapple', price: 1.50 },
    { id: 'vt14', name: 'Banana Peppers', price: 1.00 },
    { id: 'vt15', name: 'Broccoli', price: 1.50 },
    { id: 'vt16', name: 'Zucchini', price: 1.50 },
];

const meatToppings = [
    { id: 'mt1', name: 'Pepperoni', price: 2.50 },
    { id: 'mt2', name: 'Italian Sausage', price: 2.50 },
    { id: 'mt3', name: 'Grilled Chicken', price: 3.00 },
    { id: 'mt4', name: 'Bacon Strips', price: 2.50 },
    { id: 'mt5', name: 'Ham', price: 2.00 },
    { id: 'mt6', name: 'Ground Beef', price: 2.50 },
    { id: 'mt7', name: 'Butter Chicken', price: 3.50 },
    { id: 'mt8', name: 'BBQ Chicken', price: 3.00 },
    { id: 'mt9', name: 'Tandoori Chicken', price: 3.50 },
    { id: 'mt10', name: 'Salami', price: 2.50 },
    { id: 'mt11', name: 'Smoked Turkey', price: 3.00 },
    { id: 'mt12', name: 'Anchovies', price: 2.00 },
    { id: 'mt13', name: 'Prosciutto', price: 3.50 },
    { id: 'mt14', name: 'Lamb Mince', price: 3.50 },
    { id: 'mt15', name: 'Chorizo', price: 3.00 },
    { id: 'mt16', name: 'Shrimp', price: 4.00 },
];

const freeToppings = [
    { id: 'ft1', name: 'Oregano', price: 0.00 },
    { id: 'ft2', name: 'Basil', price: 0.00 },
    { id: 'ft3', name: 'Chili Flakes', price: 0.00 },
    { id: 'ft4', name: 'Garlic Powder', price: 0.00 },
    { id: 'ft5', name: 'Parsley', price: 0.00 },
    { id: 'ft6', name: 'Parmesan Dust', price: 0.00 },
    { id: 'ft7', name: 'Black Pepper', price: 0.00 },
    { id: 'ft8', name: 'Italian Herbs', price: 0.00 },
    { id: 'ft9', name: 'Sea Salt', price: 0.00 },
    { id: 'ft10', name: 'Rosemary', price: 0.00 },
    { id: 'ft11', name: 'Thyme', price: 0.00 },
    { id: 'ft12', name: 'Olive Oil Drizzle', price: 0.00 },
    { id: 'ft13', name: 'Balsamic Glaze', price: 0.00 },
    { id: 'ft14', name: 'Truffle Oil', price: 0.00 },
    { id: 'ft15', name: 'Hot Sauce', price: 0.00 },
    { id: 'ft16', name: 'Ranch Drizzle', price: 0.00 },
];

const toppingCategories = [
    { id: 'veggie', label: 'Veggie Toppings', options: veggieToppings },
    { id: 'meat', label: 'Meat Toppings', options: meatToppings },
    { id: 'free', label: 'Free Toppings', options: freeToppings },
];

// ─── Popular Topping Combos (most-ordered presets) ──────
const POPULAR_COMBOS = [
    {
        id: 'combo-1',
        label: 'Combination 1',
        toppings: [
            { id: 'vt1', name: 'Mushrooms', price: 1.50 },
            { id: 'vt2', name: 'Onions', price: 1.00 },
            { id: 'vt4', name: 'Black Olives', price: 1.50 },
            { id: 'ft1', name: 'Oregano', price: 0.00 },
        ],
    },
    {
        id: 'combo-2',
        label: 'Combination 2',
        toppings: [
            { id: 'mt1', name: 'Pepperoni', price: 2.50 },
            { id: 'mt2', name: 'Italian Sausage', price: 2.50 },
            { id: 'vt6', name: 'Jalapeños', price: 1.50 },
            { id: 'ft2', name: 'Basil', price: 0.00 },
            { id: 'ft3', name: 'Chili Flakes', price: 0.00 },
        ],
    },
    {
        id: 'combo-3',
        label: 'Combination 3',
        toppings: [
            { id: 'mt3', name: 'Grilled Chicken', price: 3.00 },
            { id: 'vt3', name: 'Green Peppers', price: 1.00 },
            { id: 'vt9', name: 'Red Onions', price: 1.00 },
            { id: 'mt8', name: 'BBQ Chicken', price: 3.00 },
            { id: 'ft8', name: 'Italian Herbs', price: 0.00 },
            { id: 'ft13', name: 'Balsamic Glaze', price: 0.00 },
        ],
    },
];

// ─── Sauce & Cheese data ──────────────────────────────────────
const sauceOptions = [
    { id: 'sauce-regular', name: 'Regular', price: 0, isDefault: true },
    { id: 'sauce-achari', name: 'Achari', price: 2.50 },
    { id: 'sauce-butter-chicken', name: 'Butter Chicken', price: 1.50 },
    { id: 'sauce-butter-chicken-2', name: 'Butter Chicken', price: 1.50 },
    { id: 'sauce-regular-2', name: 'Regular', price: 0 },
    { id: 'sauce-achari-2', name: 'Achari', price: 2.50 },
    { id: 'sauce-butter-chicken-3', name: 'Butter Chicken', price: 1.50 },
    { id: 'sauce-butter-chicken-4', name: 'Butter Chicken', price: 1.50 },
    { id: 'sauce-achari-3', name: 'Achari', price: 2.50 },
    { id: 'sauce-butter-chicken-5', name: 'Butter Chicken', price: 1.50 },
];

const cheeseOptions = [
    { id: 'cheese-regular', name: 'Regular', price: 0, isDefault: true },
    { id: 'cheese-full', name: 'Full Cheese', price: 2.50 },
    { id: 'cheese-extra', name: 'Extra Cheese', price: 1.50 },
];

export const POSProductConfigurator: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productIds = useMemo(() => {
        const idParam = searchParams.get('productIds') || searchParams.get('productId') || '';
        if (idParam.includes(',')) {
            return idParam.split(',').filter(Boolean);
        }
        return [idParam || mockPOSProducts[0]?.id];
    }, [searchParams]);

    const pizzaCount = useMemo(() => {
        const qtyParam = searchParams.get('qty');
        if (qtyParam) {
            return Math.min(4, Math.max(1, parseInt(qtyParam, 10)));
        }
        return productIds.length;
    }, [searchParams, productIds]);

    const { cart, removeFromCart, updateQuantity, updateCartItem, clearCart, cartTotal, setCart } = usePOS();

    const createDefaultConfig = useCallback((prodId: string): PizzaConfig => {
        const prod = mockPOSProducts.find(p => p.id === prodId) || mockPOSProducts[0];
        const defaults: Record<string, string> = {};
        prod?.variantGroups?.forEach(g => {
            const def = g.options.find(o => o.isDefault) || g.options[0];
            if (def) defaults[g.id] = def.id;
        });
        return {
            productId: prodId,
            selectedVariants: defaults,
            selectedToppings: {},
            selectedSauce: 'sauce-regular',
            selectedCheese: 'cheese-regular',
            removedIngredients: new Set(),
            kitchenNotes: '',
            portionMode: 'SINGLE',
            selectedPortion: 'WHOLE'
        };
    }, []);

    // ─── Multi-Pizza State ──────────────────────────────────
    const [activeCategory, setActiveCategory] = useState<CategoryView>('SIZE_CRUST');
    const [activePizzaIndex, setActivePizzaIndex] = useState(0);
    const [pizzaConfigs, setPizzaConfigs] = useState<PizzaConfig[]>(() => {
        return Array.from({ length: pizzaCount }, (_, i) => {
            const pId = productIds[i] || productIds[0] || '';
            return createDefaultConfig(pId);
        });
    });
    const [selectedAddOns, setSelectedAddOns] = useState<Record<string, AddOnSelection>>({});
    const ac = (pizzaConfigs[activePizzaIndex] || pizzaConfigs[0]) as PizzaConfig;
    const updateAC = useCallback((fn: (p: PizzaConfig) => PizzaConfig) => { setPizzaConfigs(prev => prev.map((c, i) => i === activePizzaIndex ? fn(c) : c)); }, [activePizzaIndex]);

    const activeProduct = useMemo(() => {
        const currentPId = ac?.productId || productIds[0];
        return mockPOSProducts.find(p => p.id === currentPId) || mockPOSProducts[0];
    }, [ac?.productId, productIds]);

    // ─── Derived ────────────────────────────────────────────
    const ingredients: string[] = (activeProduct as any)?.ingredients || ['Tomato Sauce', 'Mozzarella', 'Bell Peppers', 'Onions', 'Olives', 'Mushrooms'];
    const addOnOptions: { id: string; name: string; price: number }[] = [
        // 8 Dips / Sauces
        { id: 'dip-1', name: 'Dipping Sauce', price: 0.50 },
        { id: 'dip-2', name: 'Dipping Sauce', price: 0.50 },
        { id: 'dip-3', name: 'Dipping Sauce', price: 0.50 },
        { id: 'dip-4', name: 'Dipping Sauce', price: 0.50 },
        { id: 'dip-5', name: 'Dipping Sauce', price: 0.50 },
        { id: 'dip-6', name: 'Dipping Sauce', price: 0.50 },
        { id: 'dip-7', name: 'Dipping Sauce', price: 0.50 },
        { id: 'dip-8', name: 'Dipping Sauce', price: 0.50 },
        // 12 Drinks
        { id: 'drink-1', name: 'Coke 330ml', price: 2.50 },
        { id: 'drink-2', name: 'Coke 330ml', price: 2.50 },
        { id: 'drink-3', name: 'Coke 330ml', price: 2.50 },
        { id: 'drink-4', name: 'Coke 330ml', price: 2.50 },
        { id: 'drink-5', name: 'Coke 330ml', price: 2.50 },
        { id: 'drink-6', name: 'Coke 330ml', price: 2.50 },
        { id: 'drink-7', name: 'Coke 250ml', price: 2.00 },
        { id: 'drink-8', name: 'Coke 250ml', price: 2.00 },
        { id: 'drink-9', name: 'Coke 330ml', price: 2.50 },
        { id: 'drink-10', name: 'Coke 330ml', price: 2.50 },
        { id: 'drink-11', name: 'Coke 330ml', price: 2.50 },
        { id: 'drink-12', name: 'Coke 330ml', price: 2.50 },
    ];

    const getPizzaPrice = useCallback((cfg: PizzaConfig) => {
        const prod = mockPOSProducts.find(p => p.id === cfg.productId) || mockPOSProducts[0];
        let p = prod?.price || 0;
        prod?.variantGroups?.forEach(g => { const s = g.options.find(o => o.id === cfg.selectedVariants[g.id]); if (s) p += s.additionalPrice; });
        Object.values(cfg.selectedToppings).forEach(t => p += t.basePrice);
        return p;
    }, []);

    const activePizzaPrice = useMemo(() => getPizzaPrice(ac), [ac, getPizzaPrice]);
    const sharedPrice = useMemo(() => { let p = 0; Object.values(selectedAddOns).forEach(a => p += a.price * a.quantity); return p; }, [selectedAddOns]);
    const totalConfigValue = useMemo(() => pizzaConfigs.reduce((s, c) => s + getPizzaPrice(c), 0) + sharedPrice, [pizzaConfigs, getPizzaPrice, sharedPrice]);

    // ─── Sidebar items ─────────────────────────────────────
    const sauceCheeseCount = (ac.selectedSauce !== 'sauce-regular' ? 1 : 0) + (ac.selectedCheese !== 'cheese-regular' ? 1 : 0);
    const sidebarItems = useMemo(() => [
        { id: 'SIZE_CRUST' as CategoryView, label: 'Size & Crust', icon: '📐', count: Object.keys(ac.selectedVariants).length },
        { id: 'SAUCE_CHEESE' as CategoryView, label: 'Sauce & Cheese', icon: '🧀', count: sauceCheeseCount },
        { id: 'TOPPINGS' as CategoryView, label: 'Toppings', icon: '🍕', count: Object.keys(ac.selectedToppings).length },
        { id: 'DIPS_DRINKS' as CategoryView, label: 'Dips & Drinks', icon: '🥤', count: Object.values(selectedAddOns).reduce((s, a) => s + a.quantity, 0) },
    ], [ac, selectedAddOns, sauceCheeseCount]);

    // ─── Sidebar auto-advance helper ────────────────────────
    const SIDEBAR_ORDER: CategoryView[] = ['SIZE_CRUST', 'SAUCE_CHEESE', 'TOPPINGS', 'DIPS_DRINKS'];
    const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const advanceSidebar = useCallback(() => {
        // Clear any pending advance
        if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = setTimeout(() => {
            setActiveCategory(prev => {
                const idx = SIDEBAR_ORDER.indexOf(prev);
                if (idx >= 0 && idx < SIDEBAR_ORDER.length - 1) {
                    return SIDEBAR_ORDER[idx + 1] || prev;
                }
                return prev;
            });
        }, 400);
    }, []);

    // ─── Handlers (per-pizza via updateAC) ────────────────────
    const handleVariantSelect = useCallback((groupId: string, optionId: string) => {
        updateAC(c => ({ ...c, selectedVariants: { ...c.selectedVariants, [groupId]: optionId } }));
        advanceSidebar();
    }, [advanceSidebar, updateAC]);

    const handleToppingToggle = useCallback((opt: { id: string; name: string; price: number }) => {
        updateAC(c => {
            const next = { ...c.selectedToppings };
            const existing = next[opt.id];
            if (existing) {
                if (existing.portion === c.selectedPortion) {
                    delete next[opt.id];
                } else {
                    next[opt.id] = { ...existing, portion: c.selectedPortion };
                }
            } else {
                next[opt.id] = { optionId: opt.id, name: opt.name, basePrice: opt.price, portion: c.selectedPortion, level: c.portionMode === 'DOUBLE' ? 'DOUBLE' : c.portionMode === 'TRIPLE' ? 'EXTRA' : 'NORMAL' };
            }
            return { ...c, selectedToppings: next };
        });
    }, [updateAC]);

    const handleAddOnQty = useCallback((opt: { id: string; name: string; price: number }, delta: number) => {
        setSelectedAddOns(prev => {
            const next = { ...prev }; const cur = next[opt.id]?.quantity || 0; const nq = Math.max(0, cur + delta);
            if (nq === 0) delete next[opt.id]; else next[opt.id] = { optionId: opt.id, name: opt.name, price: opt.price, quantity: nq };
            return next;
        });
    }, []);

    const handleRemovalToggle = useCallback((name: string) => {
        updateAC(c => { const next = new Set(c.removedIngredients); next.has(name) ? next.delete(name) : next.add(name); return { ...c, removedIngredients: next }; });
    }, [updateAC]);


    const handleDeploy = useCallback(() => {
        const items = pizzaConfigs.map((cfg, idx) => {
            const prod = (mockPOSProducts.find(p => p.id === cfg.productId) || mockPOSProducts[0])!;
            const variants = prod?.variantGroups?.map(g => {
                const opt = g.options.find(o => o.id === cfg.selectedVariants[g.id]);
                return opt ? { groupId: g.id, optionId: opt.id, name: opt.name, price: opt.additionalPrice } : null;
            }).filter(Boolean) as any[] || [];
            return {
                id: `cfg-${Date.now()}-${idx}`,
                productId: prod.id,
                name: `${prod.name} (Pizza ${idx + 1})`,
                price: getPizzaPrice(cfg) + (idx === 0 ? sharedPrice : 0),
                quantity: 1,
                variants,
                modifiers: idx === 0 ? Object.values(selectedAddOns).map(a => ({ optionId: a.optionId, name: a.name, price: a.price, quantity: a.quantity })) : [],
                isPizza: true,
                pizzaModifiers: { toppings: Object.values(cfg.selectedToppings), addOns: idx === 0 ? Object.values(selectedAddOns) : [], removals: Array.from(cfg.removedIngredients) },
                kitchenNote: cfg.kitchenNotes || undefined,
            };
        });
        setCart((prev: any[]) => [...prev, ...items]);
        router.push('/pos/menu');
    }, [pizzaConfigs, selectedAddOns, getPizzaPrice, sharedPrice, setCart, router]);

    const quickTags = ['Extra Crispy', 'Light Bake', 'Well Done', 'Cut into 4', 'Cut into 6', 'No Oregano'];
    const displayName = activeProduct?.name || 'Pepperoni Feast';

    // ─── Live Preview (active pizza) ─────────────────────
    const livePreviewItem = useMemo(() => {
        const variants = activeProduct?.variantGroups?.map(g => {
            const opt = g.options.find(o => o.id === ac.selectedVariants[g.id]);
            return opt ? { groupId: g.id, optionId: opt.id, name: opt.name, price: opt.additionalPrice } : null;
        }).filter(Boolean) as any[] || [];
        return {
            id: 'live-preview',
            productId: activeProduct?.id || '',
            name: pizzaCount > 1 ? `${activeProduct?.name} (Pizza ${activePizzaIndex + 1}/${pizzaCount})` : (activeProduct?.name || ''),
            price: activePizzaPrice,
            quantity: 1,
            variants,
            modifiers: Object.values(selectedAddOns).map(a => ({ optionId: a.optionId, name: a.name, price: a.price, quantity: a.quantity })),
            isPizza: true,
            pizzaModifiers: { toppings: Object.values(ac.selectedToppings), addOns: Object.values(selectedAddOns), removals: Array.from(ac.removedIngredients) },
            kitchenNote: ac.kitchenNotes || undefined,
        };
    }, [activeProduct, ac, selectedAddOns, activePizzaPrice, activePizzaIndex, pizzaCount]);

    return (
        <div className="pos-screen" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* ═══ HEADER ═══ */}
            <div style={{
                padding: '12px 24px',
                background: 'var(--pos-bg-surface)',
                borderBottom: '1px solid var(--pos-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexShrink: 0
            }}>
                <button onClick={() => router.push('/pos/menu')} style={{ width: '44px', height: '44px', borderRadius: '12px', border: '1px solid var(--pos-border-subtle)', background: 'var(--pos-bg-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pos-text-primary)' }}>
                    <ArrowLeft size={22} />
                </button>

                {/* Product name + ingredients banner */}
                <div style={{ flex: '0 0 auto', maxWidth: '340px' }}>
                    {/* Ingredient pill banner */}
                    <div style={{
                        display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center',
                        background: 'var(--pos-action-primary)',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        marginBottom: '4px'
                    }}>
                        {ingredients.map((ing, i) => (
                            <span key={ing} style={{
                                fontSize: '9px',
                                fontWeight: 800,
                                color: 'white',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            }}>
                                {ing}{i < ingredients.length - 1 ? ',' : ''}
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>{pizzaCount > 1 ? `${pizzaCount} PIZZAS WITH 3 TOPPINGS EACH` : displayName}</div>
                    </div>
                </div>

                {/* Kitchen Notes area - inline in header matching screenshot */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>🍳 Kitchen Notes</span>
                        <span style={{ fontSize: '11px', color: 'var(--pos-text-muted)' }}>{ac.kitchenNotes.length}/150</span>
                    </div>
                    <input value={ac.kitchenNotes} onChange={e => updateAC(c => ({ ...c, kitchenNotes: e.target.value.slice(0, 150) }))} placeholder="Tap instructions below or type here..." style={{ width: '100%', height: '36px', padding: '0 14px', background: 'var(--pos-bg-main)', border: '1px solid var(--pos-border-subtle)', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: 'var(--pos-text-primary)', outline: 'none' }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {quickTags.map(tag => (
                            <button key={tag} onClick={() => updateAC(c => ({ ...c, kitchenNotes: (c.kitchenNotes.includes(tag) ? c.kitchenNotes : (c.kitchenNotes.trim() ? `${c.kitchenNotes.trim()}, ${tag}` : tag)).slice(0, 150) }))} style={{ height: '28px', padding: '0 12px', borderRadius: '8px', background: ac.kitchenNotes.includes(tag) ? 'var(--pos-action-primary)' : 'rgba(31,164,169,0.05)', border: '1px solid rgba(31,164,169,0.15)', fontSize: '11px', fontWeight: 800, color: ac.kitchenNotes.includes(tag) ? 'white' : 'var(--pos-text-secondary)', cursor: 'pointer' }}>
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ MAIN 3-COLUMN LAYOUT ═══ */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* LEFT: Sidebar */}
                <ConfiguratorSidebar items={sidebarItems} active={activeCategory} onSelect={setActiveCategory} />

                {/* CENTER: Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Pizza Tabs */}
                    {pizzaCount > 1 && (
                        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--pos-border-subtle)', flexShrink: 0, background: 'var(--pos-bg-surface)', padding: '0 32px' }}>
                            {Array.from({ length: pizzaCount }, (_, i) => (
                                <button key={i} onClick={() => { setActivePizzaIndex(i); setActiveCategory('SIZE_CRUST'); }} style={{ padding: '14px 28px', border: 'none', borderBottom: i === activePizzaIndex ? '3px solid var(--pos-action-primary)' : '3px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: 900, color: i === activePizzaIndex ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {pizzaConfigs[i] && Object.keys(pizzaConfigs[i]!.selectedToppings).length > 0 && i !== activePizzaIndex && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />}
                                    PIZZA {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }} className="pos-scroll">
                        {activeCategory === 'SIZE_CRUST' && activeProduct?.variantGroups && (
                            <SizeCrustView variantGroups={activeProduct.variantGroups} selectedVariants={ac.selectedVariants} onVariantSelect={handleVariantSelect} />
                        )}
                        {activeCategory === 'SAUCE_CHEESE' && (
                            <SauceCheeseView
                                sauceOptions={sauceOptions}
                                cheeseOptions={cheeseOptions}
                                selectedSauce={ac.selectedSauce}
                                selectedCheese={ac.selectedCheese}
                                onSauceSelect={(id) => { updateAC(c => ({ ...c, selectedSauce: id })); advanceSidebar(); }}
                                onCheeseSelect={(id) => { updateAC(c => ({ ...c, selectedCheese: id })); advanceSidebar(); }}
                            />
                        )}
                        {activeCategory === 'TOPPINGS' && (
                            <ToppingsView
                                preSelected={ingredients}
                                removedIngredients={ac.removedIngredients}
                                onRemovalToggle={handleRemovalToggle}
                                toppingCategories={toppingCategories}
                                selectedToppings={ac.selectedToppings}
                                onToppingToggle={handleToppingToggle}
                                popularCombos={POPULAR_COMBOS}
                                onApplyCombo={(combo) => {
                                    updateAC(c => {
                                        const next = { ...c.selectedToppings };
                                        combo.toppings.forEach(t => {
                                            next[t.id] = { optionId: t.id, name: t.name, basePrice: t.price, portion: c.selectedPortion, level: 'NORMAL' };
                                        });
                                        return { ...c, selectedToppings: next };
                                    });
                                }}
                            />
                        )}
                        {activeCategory === 'DIPS_DRINKS' && (
                            <DipsDrinksView addOnOptions={addOnOptions} selectedAddOns={selectedAddOns} onAddOnQty={handleAddOnQty} />
                        )}
                    </div>

                    {/* Portion Selector */}
                    <div style={{ borderTop: '1px solid var(--pos-border-subtle)', flexShrink: 0, background: 'var(--pos-bg-main)' }}>
                        <PortionSelector mode={ac.portionMode} onModeChange={(m) => updateAC(c => ({ ...c, portionMode: m }))} portion={ac.selectedPortion} onPortionChange={(p) => updateAC(c => ({ ...c, selectedPortion: p }))} />
                    </div>

                    {/* ═══ PRICING FOOTER ═══ */}
                    <div style={{
                        padding: '16px 32px',
                        background: 'var(--pos-bg-surface)',
                        borderTop: '1px solid var(--pos-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '32px',
                        flexShrink: 0
                    }}>
                        {[
                            { label: 'Total', value: totalConfigValue },
                            { label: `Pizza ${activePizzaIndex + 1}`, value: activePizzaPrice },
                            { label: 'Shared', value: sharedPrice },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--pos-text-muted)', textTransform: 'uppercase' }}>{label}</div>
                                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--pos-text-primary)' }}>${value.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Cart Panel */}
                <POSCartPanel
                    cart={cart}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    onEditItem={() => {}}
                    onClearCart={clearCart}
                    onHoldOrder={() => {}}
                    total={cartTotal}
                    onCheckout={() => router.push('/pos/payment')}
                    onUpdateItem={updateCartItem}
                    previewItem={livePreviewItem as any}
                    footerAction={
                        <button onClick={handleDeploy} style={{
                            width: '100%',
                            height: '56px',
                            borderRadius: '14px',
                            background: 'var(--pos-action-primary)',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: 900,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            textTransform: 'uppercase',
                            boxShadow: '0 8px 20px -4px rgba(31, 164, 169, 0.4)',
                            transition: 'all 0.2s'
                        }}>
                            <ShoppingCart size={20} strokeWidth={3} /> DEPLOY {pizzaCount > 1 ? `${pizzaCount} PIZZAS` : ''} — ${totalConfigValue.toFixed(2)}
                        </button>
                    }
                />
            </div>
        </div>
    );
};
