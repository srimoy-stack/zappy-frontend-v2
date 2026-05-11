'use client';

import { useState, useMemo, useRef, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import {
    Search,
    ShoppingBag,
    User,
    Truck,
    ArrowLeft
} from 'lucide-react';
import { POSCustomizationModal } from '@/modules/pos/components/POSCustomizationModal';
import { POSPizzaModifierModal } from '@/modules/pos/components/POSPizzaModifierModal';
import { POSCartPanel } from '@/modules/pos/components/POSCartPanel';
import { POSProduct } from '@/modules/pos/types/pos';

// Using mock data from the main POS if possible, or defining matching set here
const MOCK_CATEGORIES = [
    { id: 'all', name: 'Trending', icon: '🔥' },
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
            }
        ],
        isVeg: true,
        isAvailable: true,
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
    }
];

export default function CallCenterMenuPage() {
    const router = useRouter();
    const {
        selectedCustomer,
        session,
        cart,
        addToCart,
        updateCartItem,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal
    } = usePOS();

    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);

    // Customization states
    const [customizationProduct, setCustomizationProduct] = useState<POSProduct | null>(null);
    const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
    const [isPizzaModalOpen, setIsPizzaModalOpen] = useState(false);
    const [editingCartItem, setEditingCartItem] = useState<any | null>(null);

    useEffect(() => {
        searchRef.current?.focus();
    }, []);

    const filteredProducts = useMemo(() => {
        return MOCK_PRODUCTS.filter(p => {
            const matchesCat = activeCategory === 'all' || p.categoryId === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    const handleProductClick = useCallback((product: POSProduct) => {
        if (!product.isAvailable) return;

        if (product.hasVariants || product.modifierGroups?.length || product.isCombo) {
            setCustomizationProduct(product);
            setEditingCartItem(null);
            if (product.categoryId === 'pizza' && !product.isCombo) {
                setIsPizzaModalOpen(true);
            } else {
                setIsCustomizationOpen(true);
            }
        } else {
            addToCart({
                ...product,
                productId: product.id,
                quantity: 1,
                variants: [],
                modifiers: [],
                notes: ''
            });
        }
    }, [addToCart]);

    const handleCustomizedAdd = useCallback((cartItem: any) => {
        if (editingCartItem) {
            updateCartItem(editingCartItem.id, { ...cartItem, id: editingCartItem.id });
        } else {
            addToCart(cartItem);
        }
        setIsCustomizationOpen(false);
        setIsPizzaModalOpen(false);
        setCustomizationProduct(null);
        setEditingCartItem(null);
    }, [editingCartItem, updateCartItem, addToCart]);

    const handleEditItem = useCallback((item: any) => {
        const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
        if (product) {
            setEditingCartItem(item);
            setCustomizationProduct(product);
            if (product.categoryId === 'pizza' && !product.isCombo) {
                setIsPizzaModalOpen(true);
            } else {
                setIsCustomizationOpen(true);
            }
        }
    }, []);

    if (!selectedCustomer) {
        router.push('/callcenter/customer-lookup');
        return null;
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
            {/* Top Bar: Search & Customer Summary */}
            <div style={{
                padding: '16px 40px',
                background: '#1e293b',
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: '40px',
                zIndex: 10
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search color="#64748b" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="SEARCH PRODUCT (F1)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            height: '64px',
                            background: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '16px',
                            paddingLeft: '60px',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 700,
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    background: '#0f172a',
                    padding: '8px 24px',
                    borderRadius: '16px',
                    border: '1px solid #334155'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>{selectedCustomer.name}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>{selectedCustomer.phone}</div>
                        </div>
                    </div>
                    <div style={{ height: '32px', width: '1px', background: '#334155' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {session?.channel === 'Delivery' ? <Truck size={20} color="white" /> : <ShoppingBag size={20} color="white" />}
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>{session?.channel?.toUpperCase()}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {session?.deliveryAddress?.text || session?.store?.name}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Categories */}
                <div style={{
                    width: '240px',
                    background: '#0f172a',
                    borderRight: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {MOCK_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: activeCategory === cat.id ? '#3b82f6' : 'transparent',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: activeCategory === cat.id ? 'white' : '#94a3b8',
                                    fontSize: '15px',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <button
                            onClick={() => router.push('/callcenter/dashboard')}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: '#334155',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <ArrowLeft size={18} /> DASHBOARD
                        </button>
                    </div>
                </div>

                {/* Main Content: Products */}
                <div style={{ flex: 1, overflowY: 'auto', background: '#0f172a', padding: '40px' }} className="pos-scroll">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '24px'
                    }}>
                        {filteredProducts.map(product => (
                            <ProductItem
                                key={product.id}
                                product={product}
                                onClick={handleProductClick}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Panel: Cart */}
                <div style={{
                    width: '450px',
                    background: '#1e293b',
                    borderLeft: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <POSCartPanel
                            onEditItem={handleEditItem}
                            onCheckout={() => router.push('/callcenter/payment')}
                            cart={cart}
                            onUpdateQuantity={updateQuantity}
                            onRemoveItem={removeFromCart}
                            onClearCart={clearCart}
                            onUpdateItem={updateCartItem}
                            onHoldOrder={() => console.log('Order Held')}
                            total={cartTotal}
                        />
                    </div>
                </div>
            </div>

            {/* Customization Modals */}
            {isCustomizationOpen && customizationProduct && (
                <POSCustomizationModal
                    isOpen={isCustomizationOpen}
                    product={customizationProduct}
                    onClose={() => setIsCustomizationOpen(false)}
                    onAddToCart={handleCustomizedAdd}
                    initialItem={editingCartItem}
                />
            )}

            {isPizzaModalOpen && customizationProduct && (
                <POSPizzaModifierModal
                    isOpen={isPizzaModalOpen}
                    product={customizationProduct}
                    onClose={() => setIsPizzaModalOpen(false)}
                    onAddToCart={handleCustomizedAdd}
                    initialItem={editingCartItem}
                />
            )}

            <style jsx global>{`
                .pos-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .pos-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .pos-scroll::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                .product-card:hover {
                    box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.3);
                    border-color: #3b82f6 !important;
                    transform: translateY(-4px);
                }
                .product-card:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
}

const ProductItem = memo(({ product, onClick }: { product: POSProduct, onClick: (p: POSProduct) => void }) => (
    <button
        onClick={() => onClick(product)}
        style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '24px',
            padding: '24px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}
        className="product-card"
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: 0 }}>{product.name}</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 700 }}>SKU: {product.sku}</p>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 950, color: '#3b82f6' }}>
                ${product.price.toFixed(2)}
            </div>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.5, flex: 1 }}>
            Deliciously crafted with premium ingredients and our signature recipe.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {product.hasVariants && (
                <span style={{ fontSize: '10px', background: '#334155', color: 'white', padding: '4px 8px', borderRadius: '6px', fontWeight: 800 }}>CUSTOMIZABLE</span>
            )}
            {product.isVeg && (
                <span style={{ fontSize: '10px', background: '#065f46', color: '#34d399', padding: '4px 8px', borderRadius: '6px', fontWeight: 800 }}>VEG</span>
            )}
        </div>
    </button>
));

ProductItem.displayName = 'ProductItem';
