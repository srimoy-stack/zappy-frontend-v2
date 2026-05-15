'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/store/kioskStore';
import PizzaBuilder from '@/modules/kiosk/components/PizzaBuilder';

export default function KioskBuilderPage() {
    const router = useRouter();
    const { addToCart, pizzaBuilderState, resetBuilder } = useKioskStore();
    const [showUpsell, setShowUpsell] = useState(false);

    const handleConfirmPizza = () => {
        setShowUpsell(true);
    };

    const handleAddToCart = (withUpsell: string | null = null) => {
        const pizzaId = Math.random().toString(36).substr(2, 9);

        // Calculate total for pizza
        const SIZES = [
            { id: 'small', price: 10.99 },
            { id: 'medium', price: 13.99 },
            { id: 'large', price: 16.99 },
        ];
        const CRUSTS = [
            { id: 'thin', upcharge: 0 },
            { id: 'pan', upcharge: 2.00 },
            { id: 'stuffed', upcharge: 3.50 },
        ];
        const TIER_PRICE = 1.50;

        const sizePrice = SIZES.find(s => s.id === pizzaBuilderState.size)?.price || 0;
        const crustPrice = CRUSTS.find(c => c.id === pizzaBuilderState.crust)?.upcharge || 0;
        const toppingsPrice = pizzaBuilderState.toppings.length * TIER_PRICE;
        const unitPrice = sizePrice + crustPrice + toppingsPrice;

        addToCart({
            id: pizzaId,
            productId: 'byo-pizza',
            name: `${pizzaBuilderState.size} ${pizzaBuilderState.crust} Pizza`,
            basePrice: sizePrice,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
            selectedModifiers: {},
            selectedCombo: {},
            toppings: pizzaBuilderState.toppings,
            size: pizzaBuilderState.size!,
            crust: pizzaBuilderState.crust!,
            quantity: 1,
            kitchenNote: '',
            price: unitPrice,
            finalTotal: unitPrice,
            type: 'pizza'
        });

        if (withUpsell === 'drink') {
            addToCart({
                id: Math.random().toString(36).substr(2, 9),
                productId: 'drink-1',
                name: '2L Coca-Cola',
                basePrice: 3.49,
                image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500',
                selectedModifiers: {},
                selectedCombo: {},
                quantity: 1,
                kitchenNote: '',
                price: 3.49,
                finalTotal: 3.49,
                type: 'item'
            });
        } else if (withUpsell === 'dip') {
            addToCart({
                id: Math.random().toString(36).substr(2, 9),
                productId: 'side-2',
                name: 'Creamy Garlic Dip',
                basePrice: 0.99,
                image: 'https://images.unsplash.com/photo-1571217623102-3f86e300971e?w=500',
                selectedModifiers: {},
                selectedCombo: {},
                quantity: 1,
                kitchenNote: '',
                price: 0.99,
                finalTotal: 0.99,
                type: 'item'
            });
        }

        resetBuilder();
        router.push('/kiosk/menu');
    };

    return (
        <div className="flex-1 flex flex-col relative h-screen">
            <header className="h-[100px] flex items-center justify-between px-10 border-b border-zinc-100 shrink-0">
                <button
                    onClick={() => router.back()}
                    className="p-4 rounded-3xl bg-zinc-100 font-bold text-xl active:scale-90"
                >
                    Back
                </button>
                <h1 className="text-3xl font-black">Pizza Builder</h1>
                <div className="w-20"></div>
            </header>

            <div className="flex-1 overflow-hidden">
                <PizzaBuilder onAddToCart={handleConfirmPizza} />
            </div>

            {/* Upsell Modal */}
            {showUpsell && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-12 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] p-12 w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-6xl font-black text-zinc-900 leading-tight">Thirsty?</h2>
                            <p className="text-2xl text-zinc-500 font-medium">Add a 2L Coca-Cola for just $3.49</p>
                        </div>

                        <div className="relative w-72 h-72">
                            <img
                                src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500"
                                alt="Coke"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="w-full space-y-4">
                            <button
                                onClick={() => handleAddToCart('drink')}
                                className="w-full py-8 bg-brand text-white rounded-[32px] text-3xl font-black uppercase tracking-widest shadow-2xl shadow-brand/20 active:scale-95 transition-all"
                            >
                                Add Drink & Continue
                            </button>
                            <button
                                onClick={() => handleAddToCart('dip')}
                                className="w-full py-6 bg-zinc-100 text-zinc-600 rounded-[32px] text-2xl font-black uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Add Dipping Sauce ($0.99)
                            </button>
                            <button
                                onClick={() => handleAddToCart()}
                                className="w-full py-4 text-zinc-400 text-xl font-bold underline"
                            >
                                No Thanks, just the pizza
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
