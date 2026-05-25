'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    ShoppingBag,
    Utensils,
    Truck,
    Tags,
    User,
    RotateCcw,
    ChevronDown,
    Check,
    LayoutGrid,
    Grid3x3,
    X,
    ChevronRight,
    Clock
} from 'lucide-react';
import { usePOS } from '@/modules/pos/context/POSContext';
import { POSProduct } from '@/modules/pos/types/pos';
import POSDiscountModal from '../components/POSDiscountModal';
import { POSCustomizationModal } from '../components/POSCustomizationModal';
import { POSCartPanel } from '../components/POSCartPanel';
import { POSPizzaModifierModal } from '../components/POSPizzaModifierModal';
import { ShiftOpeningModal } from '../components/ShiftOpeningModal';
import { mockStores } from '../mock/posData';
import '../styles/pos-rush.css';
import { POSBackButton } from '../components/POSBackButton';

// Enhanced Mock Data with more metadata
const MOCK_CATEGORIES = [
    { id: 'all', name: 'Trending', icon: <Tags size={20} /> },
    { id: 'offers', name: 'Discounts & Combos', icon: '🎁' },
    { id: 'pizza', name: 'Pizzas', icon: '🍕' },
    { id: 'burger', name: 'Burgers', icon: '🍔' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
    { id: 'sides', name: 'Sides', icon: '🍟' },
    { id: 'dessert', name: 'Desserts', icon: '🍰' },
];

const MOCK_PRODUCTS: POSProduct[] = [
    {
        id: 'p1',
        name: 'Margherita Pizza',
        price: 12.99,
        categoryId: 'pizza',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&w=800&q=80',
        sku: 'PZ-MAR-001',
        hasVariants: true,
        variantGroups: [
            {
                id: 'vg1',
                name: 'Size',
                options: [
                    { id: 'vo1', name: 'Regular 8"', additionalPrice: 0 },
                    { id: 'vo2', name: 'Medium 10"', additionalPrice: 3.50 },
                    { id: 'vo3', name: 'Large 12"', additionalPrice: 6.00 }
                ]
            },
            {
                id: 'vg2',
                name: 'Crust',
                options: [
                    { id: 'vo4', name: 'Classic Thin', additionalPrice: 0 },
                    { id: 'vo5', name: 'Cheese Burst', additionalPrice: 2.50 },
                    { id: 'vo6', name: 'Wheat Crust', additionalPrice: 1.50 }
                ]
            }
        ],
        modifierGroups: [
            {
                id: 'mg1',
                name: 'Premium Toppings',
                options: [
                    { id: 'mo1', name: 'Extra Cheese', price: 1.50 },
                    { id: 'mo2', name: 'Pepperoni', price: 2.00 },
                    { id: 'mo3', name: 'Mushrooms', price: 1.20 },
                    { id: 'mo4', name: 'Grilled Chicken', price: 2.50 },
                    { id: 'mo5', name: 'Black Olives', price: 0.80 }
                ]
            },
            {
                id: 'mg2',
                name: 'Add-ons',
                options: [
                    { id: 'mo6', name: 'Dipping Sauce', price: 0.50 },
                    { id: 'mo7', name: 'Coke 330ml', price: 2.50 },
                    { id: 'mo8', name: 'Garlic Dip', price: 0.75 }
                ]
            }
        ],
        isVeg: true,
        isAvailable: true,
        isFavorite: true,
        isTopItem: true,
        barcode: '12345678901'
    },
    {
        id: 'p2',
        name: 'Pepperoni Feast',
        price: 14.99,
        categoryId: 'pizza',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
        sku: 'PZ-PEP-001',
        hasVariants: true,
        variantGroups: [
            {
                id: 'vg3',
                name: 'Portion Type',
                options: [
                    { id: 'vo7', name: 'Half (2 Slices)', additionalPrice: 0 },
                    { id: 'vo8', name: 'Full (4 Slices)', additionalPrice: 5.50 }
                ]
            }
        ],
        isVeg: false,
        isAvailable: true,
        isTopItem: true,
        barcode: '12345678902'
    },
    {
        id: 'p3',
        name: 'Veggie Supreme',
        price: 13.99,
        categoryId: 'pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        sku: 'PZ-VEG-001',
        hasVariants: true,
        variantGroups: [
            {
                id: 'vg1',
                name: 'Size',
                options: [
                    { id: 'vo1', name: 'Regular 8"', additionalPrice: 0 },
                    { id: 'vo2', name: 'Medium 10"', additionalPrice: 3.50 },
                    { id: 'vo3', name: 'Large 12"', additionalPrice: 6.00 }
                ]
            },
            {
                id: 'vg2',
                name: 'Crust',
                options: [
                    { id: 'vo4', name: 'Classic Thin', additionalPrice: 0 },
                    { id: 'vo5', name: 'Cheese Burst', additionalPrice: 2.50 }
                ]
            }
        ],
        isVeg: true,
        isAvailable: true,
        isFavorite: true,
        ingredients: ['Tomato Sauce', 'Mozzarella', 'Bell Peppers', 'Onions', 'Olives', 'Mushrooms'],
        modifierGroups: [
            {
                id: 'mg1',
                name: 'Premium Toppings',
                options: [
                    { id: 'mo1', name: 'Extra Cheese', price: 1.50 },
                    { id: 'mo2', name: 'Bell Peppers', price: 1.20 },
                    { id: 'mo3', name: 'Baby Corn', price: 1.80 },
                    { id: 'mo4', name: 'Jalapenos', price: 1.00 }
                ]
            },
            {
                id: 'mg3',
                name: 'Crust Extras',
                options: [
                    { id: 'mo10', name: 'Garlic Butter Crust', price: 0.75 },
                    { id: 'mo11', name: 'Sesame Crust', price: 0.50 }
                ]
            }
        ]
    },
    {
        id: 'p10',
        name: 'Pizza Duo Combo',
        price: 24.99,
        categoryId: 'pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        sku: 'CB-PIZ-002',
        hasVariants: true,
        isCombo: true,
        isVeg: false,
        isAvailable: true,
        variantGroups: [
            {
                id: 'vg4',
                name: 'Shared Size',
                options: [
                    { id: 'vo10', name: 'Medium Duo', additionalPrice: 0 },
                    { id: 'vo11', name: 'Large Duo', additionalPrice: 8.00 }
                ]
            }
        ],
        comboSlots: [
            { id: 'cs1', name: 'Pizza 1', allowedCategoryIds: ['pizza'] },
            { id: 'cs2', name: 'Pizza 2', allowedCategoryIds: ['pizza'] }
        ]
    },
    {
        id: 'p4',
        name: 'Classic Burger',
        price: 8.99,
        categoryId: 'burger',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        sku: 'BG-CLS-001',
        hasVariants: true,
        isVeg: false,
        isAvailable: true,
        barcode: '12345678904'
    },
    {
        id: 'p5',
        name: 'Cheese Burger',
        price: 9.99,
        categoryId: 'burger',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
        sku: 'BG-CHS-001',
        hasVariants: true,
        isVeg: false,
        isAvailable: true,
        barcode: '12345678904'
    },
    {
        id: 'p6',
        name: 'Coca Cola',
        price: 2.50,
        categoryId: 'drinks',
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80',
        sku: 'DR-COC-001',
        hasVariants: false,
        isVeg: true,
        isAvailable: true,
        isTopItem: true
    },
    {
        id: 'p7',
        name: 'French Fries',
        price: 3.99,
        categoryId: 'sides',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
        sku: 'SD-FRS-001',
        hasVariants: false,
        isVeg: true,
        isAvailable: true
    },
    {
        id: 'p8',
        name: 'Chocolate Cake',
        price: 5.99,
        categoryId: 'dessert',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        sku: 'DS-CHC-001',
        hasVariants: false,
        isVeg: true,
        isAvailable: true
    },
    {
        id: 'p9',
        name: 'Spicy Paneer Burger',
        price: 10.99,
        categoryId: 'burger',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        sku: 'BG-PNR-001',
        hasVariants: false,
        isVeg: true,
        isAvailable: true
    },
    {
        id: 'p11',
        name: 'Garlic Bread',
        price: 4.99,
        categoryId: 'sides',
        image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80',
        sku: 'SD-GRL-001',
        hasVariants: false,
        isVeg: true,
        isAvailable: true,
        isOnHold: true
    },
    {
        id: 'p_combo1',
        name: 'Family Feast Combo',
        price: 49.99,
        categoryId: 'pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        sku: 'CB-FAM-001',
        isAvailable: true,
        isCombo: true,
        isTopItem: true,
        isVeg: true,
        hasVariants: false,
        ingredients: ['2 Large Pizzas', '1 Side', '1 Beverage'],
        slots: [
            {
                id: 'SLOT1',
                name: 'Main Pizza',
                required: true,
                options: [
                    { id: 'P1', name: 'Margherita Pizza', price: 0, image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&w=800&q=80' },
                    { id: 'P2', name: 'Pepperoni Pizza', price: 2.00, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80' },
                ],
                variantGroups: [
                    {
                        id: 'SIZE1',
                        name: 'Size',
                        required: true,
                        options: [
                            { id: 'S', name: 'Small', additionalPrice: -3.00 },
                            { id: 'M', name: 'Medium', additionalPrice: 0 },
                            { id: 'L', name: 'Large', additionalPrice: 3.00 },
                        ]
                    }
                ]
            },
            {
                id: 'SLOT2',
                name: 'Side Item',
                required: true,
                options: [
                    { id: 'FRIES', name: 'French Fries', price: 0, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80' },
                    { id: 'WINGS', name: 'Chicken Wings', price: 2.50, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80' },
                ]
            }
        ]
    },
    {
        id: 'o1',
        name: '10% Off Orders over $50',
        price: 0,
        categoryId: 'offers',
        sku: 'OFFER-10',
        isAvailable: true,
        image: '',
        isVeg: true,
        ingredients: ['Auto-applied at checkout', 'Minimum value $50'],
        hasVariants: false
    },
    {
        id: 'o2',
        name: 'BOGO Pizza (Monday Special)',
        price: 0,
        categoryId: 'offers',
        sku: 'OFFER-BOGO',
        isAvailable: true,
        image: '',
        isVeg: true,
        ingredients: ['Buy one get one free', 'Select pizzas only'],
        hasVariants: false
    }
];

export const POSMenuScreen: React.FC = () => {
    const router = useRouter();
    const {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItem,
        clearCart,
        cartTotal,
        selectedCustomer,
        session,
        setStore,
        setChannel,
        deliveryAddress,
        setDeliveryAddress,
        incomingCall
    } = usePOS();

    // UI States
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'top' | 'hold'>('all');
    const [gridLayout, setGridLayout] = useState<4 | 5 | 6 | 8>(5);
    const [detailPopup, setDetailPopup] = useState<POSProduct | null>(null);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [customizationProduct, setCustomizationProduct] = useState<POSProduct | null>(null);
    const [editingCartItem, setEditingCartItem] = useState<any | null>(null);
    const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
    const [isPizzaModalOpen, setIsPizzaModalOpen] = useState(false);
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [batchProductIds, setBatchProductIds] = useState<string[]>([]);

    const [isFulfillmentDropdownOpen, setIsFulfillmentDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFulfillmentDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Pricing States


    const searchRef = useRef<HTMLInputElement>(null);

    // Auto-open on incoming call for Call Center
    useEffect(() => {
        if (session?.posType === 'CALL_CENTER' && incomingCall && incomingCall.customerId) {
            // setIsProfileOpen(true);
        }
    }, [incomingCall, session?.posType]);

    // Validation: Require table for Dine-In
    useEffect(() => {
        if (session?.channel === 'Dine-In' && !session.activeTable) {
            router.push('/pos/table-selection');
        }
    }, [session?.channel, session?.activeTable, router]);

    // Barcode Scanner Auto-Focus
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // If not typing in another input, focus the search bar
            if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                if (e.key.length === 1 || e.key === 'Enter') {
                    searchRef.current?.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    /* 
    const handleUpdateNotes = (notes: string) => {
        if (selectedCustomer) {
            updateCustomer(selectedCustomer.id, { notes });
        }
    };

    const handleSelectAddress = (addressId: string) => {
        if (selectedCustomer) {
            const addr = selectedCustomer.addresses.find(a => a.id === addressId);
            if (addr) {
                setDeliveryAddress({ id: addr.id, text: addr.text, label: addr.label });
            }
        }
    };
    */

    // Optimized filtering
    const filteredProducts = useMemo(() => {
        return MOCK_PRODUCTS.filter(product => {
            const matchesCategory = activeCategory === 'all' || product.categoryId === activeCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.barcode && product.barcode.includes(searchQuery));

            let matchesFilter = true;
            if (activeFilter === 'favorites') matchesFilter = !!product.isFavorite;
            if (activeFilter === 'top') matchesFilter = !!product.isTopItem;
            if (activeFilter === 'hold') matchesFilter = !!product.isOnHold;

            return matchesCategory && matchesSearch && matchesFilter;
        });
    }, [activeCategory, searchQuery, activeFilter]);

    const handleProductClick = (product: any) => {
        if (!product.isAvailable) return;

        // If product has ANY customization options
        const isCustomizable = product.isCombo ||
            (product.variantGroups && product.variantGroups.length > 0) ||
            (product.modifierGroups && product.modifierGroups.length > 0);

        if (isCustomizable) {
            if (isBatchMode) {
                if (batchProductIds.length >= 4) {
                    alert('Maximum of 4 items can be batch configured at a time.');
                    return;
                }
                setBatchProductIds(prev => [...prev, product.id]);
                return;
            }
            router.push(`/pos/menu/configure?productId=${product.id}`);
            return;
        }

        addToCart({
            ...product,
            productId: product.id,
            quantity: 1,
            variants: [],
            modifiers: [],
            notes: ''
        });
    };

    const handleCustomizedAddToCart = (cartItem: any) => {
        if (editingCartItem) {
            const updatedItem = { ...cartItem, id: editingCartItem.id };
            updateCartItem(editingCartItem.id, updatedItem);
            setEditingCartItem(null);
        } else {
            addToCart(cartItem);
        }
        setCustomizationProduct(null);
        setIsCustomizationModalOpen(false);
    };

    const handleEditItem = (item: any) => {
        const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
        if (product) {
            // Always navigate to configurator for editing
            router.push(`/pos/menu/configure?productId=${product.id}`);
        }
    };

    const handleCheckout = () => {
        router.push('/pos/payment');
    };



    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && filteredProducts.length > 0) {
            handleProductClick(filteredProducts[0]);
            setSearchQuery('');
        }
    };




    return (
        <div className="pos-screen" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

            {/* 1. VERTICAL CATEGORY BAR */}
            <div style={{
                width: '220px',
                background: 'var(--pos-bg-surface)',
                borderRight: '1px solid var(--pos-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                flexShrink: 0
            }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--pos-border-subtle)' }}>
                    <POSBackButton
                        label="EXIT"
                        onClick={() => router.push('/pos/dashboard')}
                        style={{ width: '100%', height: '60px', justifyContent: 'center' }}
                    />
                </div>

                {/* Category List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }} className="no-scrollbar">
                    {MOCK_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            style={{
                                width: '100%',
                                minHeight: '64px',
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                borderRadius: '16px',
                                transition: 'all 0.2s',
                                background: activeCategory === cat.id ? 'var(--pos-action-primary)' : 'var(--pos-bg-card)',
                                color: activeCategory === cat.id ? 'white' : 'var(--pos-text-primary)',
                                border: '1px solid var(--pos-border-subtle)',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{
                                fontSize: '20px',
                                minWidth: '40px',
                                height: '40px',
                                background: activeCategory === cat.id ? 'rgba(255,255,255,0.2)' : 'var(--pos-bg-main)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '10px'
                            }}>
                                {cat.icon}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.01em',
                                flex: 1,
                                lineHeight: 1.2
                            }}>
                                {cat.name}
                            </div>
                            {activeCategory === cat.id && (
                                <div style={{ width: '4px', height: '24px', background: 'white', borderRadius: '2px' }} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. PRODUCT ZONE */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--pos-bg-main)' }}>
                {/* 2. MAIN HEADER / ACTION BAR */}
                <div style={{
                    padding: '24px 24px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    background: 'var(--pos-bg-surface)',
                    width: '100%',
                }}>

                    {/* ROW 1: Buttons Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>

                        {/* BUTTON 1: CUSTOMER (Teal) */}
                        <button
                            onClick={() => router.push('/pos/customers')}
                            className="hover-scale"
                            style={{
                                flex: 1,
                                height: '64px',
                                background: selectedCustomer ? '#14B8A6' : '#94A3B8', // Teal if customer, gray if not
                                borderRadius: '12px',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 20px',
                                gap: '14px',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: selectedCustomer ? '0 4px 6px -1px rgba(20, 184, 166, 0.2)' : '0 4px 6px -1px rgba(148, 163, 184, 0.2)'
                            }}
                        >
                            <User size={24} strokeWidth={2.5} />
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: '1.2', flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {selectedCustomer ? 'Customer' : 'Current Order'}
                                </span>
                                <span style={{ fontSize: '15px', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {selectedCustomer?.name || session?.activeCustomer?.name || 'SELECT CUSTOMER...'}
                                </span>
                            </div>
                            {selectedCustomer && (
                                <Check size={20} strokeWidth={3} style={{ opacity: 0.9 }} />
                            )}
                        </button>

                        {/* BUTTON 2: FULFILLMENT (White/Outline) */}
                        <div style={{ position: 'relative', flex: 1 }} ref={dropdownRef}>
                            <button
                                onClick={() => setIsFulfillmentDropdownOpen(!isFulfillmentDropdownOpen)}
                                className="hover-scale"
                                style={{
                                    width: '100%',
                                    height: '64px',
                                    background: '#FFFFFF',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0', // Slate-200
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 20px',
                                    gap: '14px',
                                    color: '#1E293B', // Slate-800
                                    cursor: 'pointer'
                                }}
                            >
                                {session?.channel === 'Dine-In' ? <Utensils size={24} className="text-emerald-500" /> :
                                    session?.channel === 'Delivery' ? <Truck size={24} className="text-amber-500" /> :
                                        <ShoppingBag size={24} className="text-sky-500" />}

                                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: '1.2' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Fulfillment
                                    </span>
                                    <span style={{ fontSize: '15px', fontWeight: 900 }}>
                                        {session?.channel || 'PICKUP'}
                                    </span>
                                </div>

                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Table Info if Dine-In */}
                                    {session?.channel === 'Dine-In' && session.activeTable && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push('/pos/table-selection');
                                            }}
                                            title="Change Table"
                                            className="hover:bg-emerald-200 transition-colors"
                                            style={{
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                background: '#DEF7EC',
                                                color: '#03543F',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                border: '1px solid #BCF0DA'
                                            }}
                                        >
                                            {session.activeTable.name}
                                        </span>
                                    )}
                                    <ChevronDown size={20} className="text-slate-400" />
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isFulfillmentDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '72px',
                                    left: 0,
                                    width: '100%',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                    border: '1px solid #E2E8F0',
                                    zIndex: 50,
                                    padding: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                }}>
                                    {(['Dine-In', 'Pickup', 'Delivery'] as const).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => {
                                                setChannel(mode);
                                                setIsFulfillmentDropdownOpen(false);
                                                // Redirect to tables if dine-in selected
                                                if (mode === 'Dine-In') router.push('/pos/table-selection');
                                            }}
                                            style={{
                                                padding: '12px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: session?.channel === mode ? '#F1F5F9' : 'transparent',
                                                color: session?.channel === mode ? '#0F172A' : '#64748B',
                                                fontWeight: 700,
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                textAlign: 'left'
                                            }}
                                        >
                                            {mode === 'Dine-In' && <Utensils size={16} />}
                                            {mode === 'Pickup' && <ShoppingBag size={16} />}
                                            {mode === 'Delivery' && <Truck size={16} />}
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* BUTTON 3: REFUNDS (Red) */}
                        <button
                            onClick={() => router.push('/pos/refund-management')}
                            className="hover-scale"
                            style={{
                                flex: 1,
                                height: '64px',
                                background: '#EF4444', // Red-500
                                borderRadius: '12px',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 20px',
                                gap: '14px',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            <RotateCcw size={24} strokeWidth={2.5} />
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: '1.2' }}>
                                <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Terminal
                                </span>
                                <span style={{ fontSize: '15px', fontWeight: 900 }}>
                                    REFUNDS
                                </span>
                            </div>
                        </button>

                        {/* BUTTON 4: VIEW ORDERS (Dark Slate) */}
                        <button
                            onClick={() => router.push('/pos/orders')}
                            className="hover-scale"
                            style={{
                                flex: 1,
                                height: '64px',
                                background: '#334155', // Slate-700
                                borderRadius: '12px',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 20px',
                                gap: '14px',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(51, 65, 85, 0.2)'
                            }}
                        >
                            <ShoppingBag size={24} strokeWidth={2.5} />
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: '1.2' }}>
                                <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Management
                                </span>
                                <span style={{ fontSize: '15px', fontWeight: 900 }}>
                                    VIEW ORDERS
                                </span>
                            </div>
                        </button>

                        {/* BUTTON 5: MY ORDERS (Indigo) */}
                        <button
                            onClick={() => router.push('/pos/my-orders')}
                            className="hover-scale"
                            style={{
                                flex: 1,
                                height: '64px',
                                background: '#4F46E5', // Indigo-600
                                borderRadius: '12px',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 20px',
                                gap: '14px',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                            }}
                        >
                            <Clock size={24} strokeWidth={2.5} />
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: '1.2' }}>
                                <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Cashier Desk
                                </span>
                                <span style={{ fontSize: '15px', fontWeight: 900 }}>
                                    MY ORDERS
                                </span>
                            </div>
                        </button>
                    </div>

                    {/* ROW 2: SEARCH BAR (Full Width) */}
                    <div style={{ width: '100%', position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search by Name / SKU / Barcode"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            style={{
                                width: '100%',
                                height: '64px',
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                paddingLeft: '56px',
                                paddingRight: '20px',
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#1E293B',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
                {/* Top-level Filter Tabs + Grid Layout Selector */}
                <div style={{
                    padding: '0 24px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'var(--pos-bg-surface)',
                    borderBottom: '1px solid var(--pos-border-subtle)'
                }}>
                    {
                        [
                            { id: 'all', label: 'All Items' },
                            { id: 'favorites', label: 'Favorites' },
                            { id: 'top', label: 'Top Items' },
                            { id: 'hold', label: 'On Hold' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveFilter(tab.id as any)}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    background: activeFilter === tab.id ? 'var(--pos-action-primary)' : 'var(--pos-bg-card)',
                                    color: activeFilter === tab.id ? 'white' : 'var(--pos-text-secondary)',
                                    border: '1px solid var(--pos-border-subtle)',
                                    fontWeight: 800,
                                    fontSize: '14px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.02em',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minWidth: '120px'
                                }}
                                className={activeFilter === tab.id ? '' : 'hover-scale'}
                            >
                                {tab.label}
                            </button>
                        ))
                    }

                    {/* Batch Mode Switch */}
                    <button
                        onClick={() => {
                            setIsBatchMode(!isBatchMode);
                            if (isBatchMode) setBatchProductIds([]);
                        }}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            background: isBatchMode ? 'var(--pos-action-primary)' : 'rgba(31, 164, 169, 0.05)',
                            color: isBatchMode ? 'white' : 'var(--pos-action-primary)',
                            border: '1px solid rgba(31, 164, 169, 0.2)',
                            fontWeight: 800,
                            fontSize: '14px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        className="hover-scale"
                    >
                        <span>🍕</span>
                        <span>{isBatchMode ? 'Batch Customise ON' : 'Batch Customise'}</span>
                        {batchProductIds.length > 0 && (
                            <span style={{
                                background: isBatchMode ? 'white' : 'var(--pos-action-primary)',
                                color: isBatchMode ? 'var(--pos-action-primary)' : 'white',
                                padding: '2px 8px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: 900
                            }}>
                                {batchProductIds.length}
                            </span>
                        )}
                    </button>

                    {/* Grid Layout Selector */}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--pos-bg-card)', borderRadius: '12px', padding: '4px', border: '1px solid var(--pos-border-subtle)' }}>
                        {([4, 5, 6, 8] as const).map(cols => (
                            <button
                                key={cols}
                                onClick={() => setGridLayout(cols)}
                                title={`${cols} columns`}
                                style={{
                                    width: '40px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: gridLayout === cols ? 'var(--pos-action-primary)' : 'transparent',
                                    color: gridLayout === cols ? 'white' : 'var(--pos-text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s',
                                    position: 'relative'
                                }}
                            >
                                {/* Mini grid preview icon */}
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)`, gap: '2px' }}>
                                    {Array.from({ length: Math.min(cols, 4) * 2 }).map((_, i) => (
                                        <div key={i} style={{
                                            width: cols <= 5 ? '5px' : '4px',
                                            height: cols <= 5 ? '4px' : '3px',
                                            borderRadius: '1px',
                                            background: gridLayout === cols ? 'rgba(255,255,255,0.8)' : 'currentColor',
                                            opacity: 0.7
                                        }} />
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid — Compact Cards */}
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                    <div className="pos-products-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridLayout}, 1fr)`,
                        gap: gridLayout >= 6 ? '8px' : '10px',
                        alignContent: 'start'
                    }}>
                        {filteredProducts.map(product => {
                            const isOutOfStock = !product.isAvailable;
                            return (
                                <button
                                    key={product.id}
                                    disabled={isOutOfStock}
                                    onClick={() => handleProductClick(product)}
                                    className={`pos-card ${!isOutOfStock ? 'hover-scale' : ''}`}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        background: isOutOfStock ? 'rgba(0,0,0,0.05)' : 'var(--pos-bg-surface)',
                                        border: '1.5px solid var(--pos-border-subtle)',
                                        borderRadius: gridLayout >= 6 ? '12px' : '14px',
                                        textAlign: 'left',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                        opacity: isOutOfStock ? 0.5 : 1,
                                        transition: 'all 0.15s',
                                        padding: gridLayout >= 6 ? '10px 12px' : '14px 16px',
                                        minHeight: gridLayout >= 6 ? '56px' : '68px'
                                    }}
                                >
                                    <div style={{ fontSize: gridLayout >= 6 ? '12px' : '14px', fontWeight: 900, color: 'var(--pos-text-primary)', lineHeight: 1.2, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {product.name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                        <span style={{ fontSize: gridLayout >= 6 ? '13px' : '15px', fontWeight: 900, color: 'var(--pos-action-primary)' }}>
                                            ${product.price.toFixed(2)}
                                        </span>
                                        {product.hasVariants && (
                                            <span style={{
                                                fontSize: '8px',
                                                fontWeight: 900,
                                                color: 'var(--pos-action-primary)',
                                                textTransform: 'uppercase',
                                                background: 'rgba(31,164,169,0.08)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                letterSpacing: '0.03em'
                                            }}>
                                                Customizable
                                            </span>
                                        )}
                                    </div>
                                    {isOutOfStock && (
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'rgba(255,255,255,0.6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '9px', fontWeight: 900, color: '#EF4444',
                                            textTransform: 'uppercase', letterSpacing: '0.05em'
                                        }}>
                                            Unavailable
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Batch Queue Panel */}
                {isBatchMode && (
                    <div style={{
                        background: 'var(--pos-bg-surface)',
                        borderTop: '2px solid var(--pos-action-primary)',
                        padding: '16px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 -4px 15px rgba(0,0,0,0.05)',
                        animation: 'posFadeInUp 0.25s',
                        zIndex: 100
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--pos-action-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Batch Customisation Queue
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--pos-text-muted)', fontWeight: 700 }}>
                                    Tap customizable pizzas to add. Max 4 items.
                                </div>
                            </div>

                            {/* Queued pizzas list */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {batchProductIds.length === 0 ? (
                                    <div style={{ fontSize: '13px', color: 'var(--pos-text-muted)', fontStyle: 'italic', paddingLeft: '12px' }}>
                                        No pizzas in queue yet
                                    </div>
                                ) : (
                                    batchProductIds.map((pId, idx) => {
                                        const prod = MOCK_PRODUCTS.find(p => p.id === pId);
                                        return (
                                            <div key={idx} style={{
                                                background: 'var(--pos-bg-main)',
                                                border: '1px solid var(--pos-border-subtle)',
                                                borderRadius: '10px',
                                                padding: '6px 12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '12px',
                                                fontWeight: 800,
                                                color: 'var(--pos-text-primary)'
                                            }}>
                                                <span>🍕 {prod?.name || 'Pizza'}</span>
                                                <button
                                                    onClick={() => setBatchProductIds(prev => prev.filter((_, i) => i !== idx))}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#EF4444',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <X size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Configure Button */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {batchProductIds.length > 0 && (
                                <button
                                    onClick={() => setBatchProductIds([])}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #EF4444',
                                        color: '#EF4444',
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        textTransform: 'uppercase'
                                    }}
                                    className="hover-scale"
                                >
                                    Clear Queue
                                </button>
                            )}

                            <button
                                disabled={batchProductIds.length < 2}
                                onClick={() => {
                                    router.push(`/pos/menu/configure?productIds=${batchProductIds.join(',')}`);
                                }}
                                style={{
                                    background: batchProductIds.length >= 2 ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)',
                                    color: 'white',
                                    padding: '10px 24px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontSize: '13px',
                                    fontWeight: 900,
                                    cursor: batchProductIds.length >= 2 ? 'pointer' : 'not-allowed',
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: batchProductIds.length >= 2 ? '0 4px 6px rgba(31,164,169,0.15)' : 'none'
                                }}
                                className={batchProductIds.length >= 2 ? 'hover-scale' : ''}
                            >
                                <span>Configure {batchProductIds.length} Pizzas</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ PRODUCT DETAIL POPUP ═══ */}
                {detailPopup && (
                    <div
                        onClick={() => setDetailPopup(null)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 9999,
                            animation: 'posFadeInUp 0.2s'
                        }}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '420px',
                                background: 'var(--pos-bg-surface)',
                                borderRadius: '20px',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                overflow: 'hidden',
                                animation: 'posFadeInUp 0.25s'
                            }}
                        >
                            {/* Popup Header */}
                            <div style={{
                                padding: '20px 24px',
                                background: 'linear-gradient(135deg, var(--pos-action-primary), #0d9488)',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            }}>
                                <div>
                                    <div style={{ fontSize: '20px', fontWeight: 900 }}>{detailPopup.name}</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.9, marginTop: '4px' }}>{detailPopup.sku}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ fontSize: '24px', fontWeight: 900 }}>${detailPopup.price.toFixed(2)}</div>
                                    <button
                                        onClick={() => setDetailPopup(null)}
                                        style={{
                                            width: '32px', height: '32px', borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.2)', border: 'none',
                                            color: 'white', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Popup Body */}
                            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Description */}
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Description</div>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--pos-text-secondary)', lineHeight: 1.5 }}>
                                        {detailPopup.ingredients?.join(', ') || 'Standard recipe with high-quality ingredients'}
                                    </div>
                                </div>

                                {/* Available Sizes */}
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--pos-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Available Sizes</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {(detailPopup.variantGroups?.find(g => g.name === 'Size')?.options || [{ id: 'def', name: 'Regular', additionalPrice: 0 }]).map(opt => (
                                            <span key={opt.id} style={{
                                                padding: '6px 14px',
                                                borderRadius: '8px',
                                                background: 'rgba(31,164,169,0.08)',
                                                border: '1px solid rgba(31,164,169,0.15)',
                                                fontSize: '12px',
                                                fontWeight: 800,
                                                color: 'var(--pos-action-primary)'
                                            }}>
                                                {opt.name}{opt.additionalPrice > 0 ? ` (+$${opt.additionalPrice.toFixed(2)})` : ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Item Type Badge */}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{
                                        padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 900,
                                        textTransform: 'uppercase', letterSpacing: '0.03em',
                                        background: detailPopup.hasVariants ? 'rgba(31,164,169,0.1)' : 'var(--pos-bg-main)',
                                        color: detailPopup.hasVariants ? 'var(--pos-action-primary)' : 'var(--pos-text-muted)'
                                    }}>
                                        {detailPopup.hasVariants ? 'Customizable' : 'Standard Item'}
                                    </span>
                                    {detailPopup.isVeg && (
                                        <span style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, background: 'rgba(16,185,129,0.1)', color: '#059669', textTransform: 'uppercase' }}>Veg</span>
                                    )}
                                    {detailPopup.isCombo && (
                                        <span style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, background: 'rgba(245,158,11,0.1)', color: '#D97706', textTransform: 'uppercase' }}>Combo</span>
                                    )}
                                </div>
                            </div>

                            {/* Popup Footer */}
                            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--pos-border-subtle)', display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setDetailPopup(null)}
                                    style={{
                                        flex: 1,
                                        height: '48px',
                                        borderRadius: '12px',
                                        border: '1.5px solid var(--pos-border-subtle)',
                                        background: 'var(--pos-bg-main)',
                                        color: 'var(--pos-text-secondary)',
                                        fontSize: '14px',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const p = detailPopup;
                                        setDetailPopup(null);
                                        handleProductClick(p);
                                    }}
                                    style={{
                                        flex: 2,
                                        height: '48px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'var(--pos-action-primary)',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {detailPopup.hasVariants ? 'Customize' : 'Add to Cart'}
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. CART/ORDER PANEL */}
            <POSCartPanel
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onEditItem={handleEditItem}
                onClearCart={clearCart}
                onHoldOrder={() => {
                    // Logic to save order to 'Held' state would go here
                    clearCart();
                    router.push('/pos/dashboard');
                }}
                total={cartTotal}
                onCheckout={handleCheckout}
                onUpdateItem={updateCartItem}
                channel={session?.channel}
                onChannelChange={setChannel}
                deliveryAddress={deliveryAddress}
                onAddressChange={setDeliveryAddress}
                selectedStore={session?.store}
                onStoreChange={setStore}
                availableStores={mockStores}
            />

            {/* Modals */}
            <POSDiscountModal
                isOpen={isDiscountModalOpen}
                onClose={() => setIsDiscountModalOpen(false)}
                subtotal={cartTotal}
                onApplyDiscount={(_type, _value) => {
                    // Discount logic would be handled in the payment page
                    setIsDiscountModalOpen(false);
                }}
            />

            <POSCustomizationModal
                isOpen={isCustomizationModalOpen && !!customizationProduct}
                product={customizationProduct}
                initialItem={editingCartItem}
                onClose={() => {
                    setIsCustomizationModalOpen(false);
                    setCustomizationProduct(null);
                    setEditingCartItem(null);
                }}
                onAddToCart={(item) => {
                    handleCustomizedAddToCart(item);
                }}
            />

            <POSPizzaModifierModal
                isOpen={isPizzaModalOpen && !!customizationProduct}
                product={customizationProduct}
                initialItem={editingCartItem}
                allProducts={MOCK_PRODUCTS}
                onClose={() => {
                    setIsPizzaModalOpen(false);
                    setCustomizationProduct(null);
                    setEditingCartItem(null);
                }}
                onAddToCart={(item: any) => {
                    if (editingCartItem) {
                        updateCartItem(editingCartItem.id, { ...item, id: editingCartItem.id });
                    } else {
                        addToCart(item);
                    }
                    setIsPizzaModalOpen(false);
                    setCustomizationProduct(null);
                    setEditingCartItem(null);
                }}
            />

            <ShiftOpeningModal />



        </div >
    );
};

export default POSMenuScreen;
