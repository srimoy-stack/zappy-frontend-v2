'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, ShopItem } from '../types';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: ShopItem, selections: Record<string, string>, quantity?: number) => void;
    removeFromCart: (itemId: string, selections?: Record<string, string>) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Persist cart to localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('zyappy_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('zyappy_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item: ShopItem, selections: Record<string, string>, quantity: number = 1) => {
        setCartItems(prev => {
            // Check if item with exact same selections already exists
            const existingIndex = prev.findIndex(i =>
                i.id === item.id &&
                JSON.stringify(i.selections) === JSON.stringify(selections)
            );

            if (existingIndex > -1) {
                const newItems = [...prev];
                const item = newItems[existingIndex];
                if (item) item.quantity += quantity;
                return newItems;
            }

            return [...prev, { ...item, quantity, selections }];
        });
    };

    const removeFromCart = (itemId: string, selections?: Record<string, string>) => {
        setCartItems(prev => {
            if (selections) {
                // Remove specific selection
                return prev.filter(i =>
                    !(i.id === itemId && JSON.stringify(i.selections) === JSON.stringify(selections))
                );
            }
            // Fallback to removing all matches by ID (legacy or simple items)
            return prev.filter(i => i.id !== itemId);
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
