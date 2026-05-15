'use client';

import { useEffect, useState, useRef } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { menuService, type Product, type MenuData } from '@/services/kiosk/menuService';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export function MenuScreen() {
    const {
        selectedRestaurant,
        activeCategory,
        setActiveCategory,
        cart,
        totals,
        navigateTo,
    } = useKioskStore();

    const [loading, setLoading] = useState(true);
    const [menuData, setMenuData] = useState<MenuData | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const data = await menuService.getMenu(selectedRestaurant?.id || 'default');
                setMenuData(data);
                if (data.categories?.[0] && !activeCategory) {
                    setActiveCategory(data.categories[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch menu', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [selectedRestaurant, activeCategory, setActiveCategory]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [activeCategory]);

    const filteredProducts = menuData?.products.filter(p => p.categoryId === activeCategory) || [];
    const featuredProducts = menuData?.products.slice(0, 3) || [];

    const handleProductClick = (product: Product) => {
        if (product.inventory === 0) return;
        if (product.type === 'pizza') {
            navigateTo('builder');
        } else {
            navigateTo('product', { productId: product.id });
        }
    };

    if (loading && !menuData) {
        return <MenuSkeleton />;
    }

    return (
        <div className="kiosk-menu-screen">
            {/* Header */}
            <header className="kiosk-menu-header">
                <div className="kiosk-menu-header-left">
                    <button onClick={() => navigateTo('start')} className="kiosk-back-btn">
                        <ArrowLeft size={32} />
                    </button>
                    <div className="kiosk-menu-brand-info">
                        <span className="kiosk-menu-brand-label">Ordering from</span>
                        <h2 className="kiosk-menu-brand-name">
                            {selectedRestaurant?.name || 'Zyappy Kitchen'}
                        </h2>
                    </div>
                </div>
                <button
                    onClick={() => cart.length > 0 && navigateTo('cart')}
                    className="kiosk-menu-cart-btn"
                >
                    <ShoppingCart size={28} />
                    {cart.length > 0 && (
                        <span className="kiosk-menu-cart-badge">{cart.length}</span>
                    )}
                </button>
            </header>

            {/* Main */}
            <div className="kiosk-menu-body">
                {/* Category Sidebar */}
                <aside className="kiosk-menu-sidebar">
                    <div className="kiosk-menu-sidebar-inner">
                        {menuData?.categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`kiosk-menu-category-btn ${activeCategory === category.id ? 'active' : ''}`}
                            >
                                {activeCategory === category.id && (
                                    <div className="kiosk-menu-category-indicator" />
                                )}
                                <span>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Products */}
                <main ref={scrollRef} className="kiosk-menu-products">
                    {/* Hero Banner */}
                    {activeCategory === menuData?.categories?.[0]?.id && (
                        <div className="kiosk-menu-hero-banner">
                            <img
                                src="https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800"
                                alt="Featured"
                            />
                            <div className="kiosk-menu-hero-overlay">
                                <span className="kiosk-menu-brand-label">Limited Time Offer</span>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '8px 0' }}>Bestselling Pizzas</h2>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Up to 40% Off on Combos</p>
                            </div>
                        </div>
                    )}

                    {/* Featured Section */}
                    {activeCategory === menuData?.categories?.[0]?.id && featuredProducts.length > 0 && (
                        <div className="kiosk-menu-section">
                            <h3 className="kiosk-menu-section-title">Today's Specials</h3>
                            <div className="kiosk-menu-featured-grid">
                                {featuredProducts.map(product => {
                                    const isSoldOut = product.inventory === 0;
                                    return (
                                        <button
                                            key={product.id}
                                            onClick={() => handleProductClick(product)}
                                            className={`kiosk-menu-featured-card ${isSoldOut ? 'sold-out' : ''}`}
                                            disabled={isSoldOut}
                                        >
                                            {isSoldOut && (
                                                <div className="kiosk-menu-sold-out-tag">Sold Out</div>
                                            )}
                                            <div className="kiosk-menu-featured-image">
                                                <img src={product.image} alt={product.name} />
                                            </div>
                                            <div className="kiosk-menu-featured-info">
                                                <span className="kiosk-menu-featured-name">{product.name}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span className="kiosk-menu-featured-price">${product.price.toFixed(2)}</span>
                                                    {product.calories && (
                                                        <span className="kiosk-menu-featured-cal">{product.calories} cal</span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Category Title */}
                    <div className="kiosk-menu-section">
                        <h3 className="kiosk-menu-section-title">
                            {activeCategory === menuData?.categories?.[0]?.id ? 'Our Full Menu' : menuData?.categories.find(c => c.id === activeCategory)?.name}
                        </h3>

                        {/* Product Grid */}
                        <div className="kiosk-menu-product-grid">
                            {filteredProducts.map(product => {
                                const isSoldOut = product.inventory === 0;
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => handleProductClick(product)}
                                        className={`kiosk-menu-product-card ${isSoldOut ? 'sold-out' : ''}`}
                                        disabled={isSoldOut}
                                    >
                                        <div className="kiosk-menu-product-image">
                                            <img src={product.image} alt={product.name} />
                                            {isSoldOut && (
                                                <div className="kiosk-menu-sold-out-tag" style={{ top: 12, left: 12 }}>OUT OF STOCK</div>
                                            )}
                                            {product.calories && !isSoldOut && (
                                                <div className="kiosk-menu-product-cal">
                                                    <span>{product.calories} kcal</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="kiosk-menu-product-info">
                                            <h4>{product.name}</h4>
                                            <p className="kiosk-menu-product-desc">{product.description}</p>
                                            <div className="kiosk-menu-product-price-row">
                                                <span className="kiosk-menu-product-price">${product.price.toFixed(2)}</span>
                                                {!isSoldOut && (
                                                    <div className="kiosk-menu-product-add">+</div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>

            {/* Sticky Bottom Cart Bar */}
            {cart.length > 0 && (
                <div className="kiosk-menu-bottom-bar">
                    <button
                        onClick={() => navigateTo('cart')}
                        className="kiosk-menu-bottom-bar-btn"
                    >
                        <div className="kiosk-menu-bottom-bar-left">
                            <div className="kiosk-menu-bottom-bar-icon">
                                <ShoppingCart size={28} />
                            </div>
                            <div className="kiosk-menu-bottom-bar-text">
                                <span className="kiosk-menu-bottom-bar-count">{cart.length} Item{cart.length !== 1 ? 's' : ''}</span>
                                <span className="kiosk-menu-bottom-bar-label">View My Order</span>
                            </div>
                        </div>
                        <div className="kiosk-menu-bottom-bar-total">
                            <span className="kiosk-menu-bottom-bar-total-label">Subtotal</span>
                            <span className="kiosk-menu-bottom-bar-total-value">${totals.subtotal.toFixed(2)}</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}

function MenuSkeleton() {
    return (
        <div className="kiosk-menu-screen kiosk-skeleton">
            <header className="kiosk-menu-header">
                <div className="kiosk-skeleton-box" style={{ width: 200, height: 40, borderRadius: 16 }} />
                <div className="kiosk-skeleton-box" style={{ width: 48, height: 48, borderRadius: 16 }} />
            </header>
            <div className="kiosk-menu-body">
                <aside className="kiosk-menu-sidebar">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="kiosk-skeleton-box" style={{ height: 56, borderRadius: 16, marginBottom: 12 }} />
                    ))}
                </aside>
                <main className="kiosk-menu-products">
                    <div className="kiosk-menu-product-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="kiosk-skeleton-box" style={{ height: 280, borderRadius: 24 }} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
