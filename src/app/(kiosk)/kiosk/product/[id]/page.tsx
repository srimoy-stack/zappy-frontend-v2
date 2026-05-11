'use client';

import { useEffect, useState, useMemo, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Minus, Plus, AlertCircle, Check } from 'lucide-react';
import { useKioskStore, CartItem } from '@/store/kioskStore';
import { menuService, Product } from '@/services/kiosk/menuService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function ProductCustomizationPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const productId = resolvedParams.id;
    const router = useRouter();
    const searchParams = useSearchParams();
    const editIndex = searchParams.get('edit');

    const { addToCart, updateCartItem, cart } = useKioskStore();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [kitchenNote, setKitchenNote] = useState('');

    // Selection state
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Record<string, number>>>({});
    const [selectedCombo, setSelectedCombo] = useState<Record<string, string>>({});

    // Validation state
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [invalidGroups, setInvalidGroups] = useState<string[]>([]);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const data = await menuService.getProductById(productId);
            if (data) {
                setProduct(data);

                // Check if we are in edit mode
                if (editIndex !== null) {
                    const index = parseInt(editIndex);
                    const existingItem = cart[index];
                    if (existingItem) {
                        setQuantity(existingItem.quantity);
                        setKitchenNote(existingItem.kitchenNote);
                        setSelectedModifiers(existingItem.selectedModifiers);
                        setSelectedCombo(existingItem.selectedCombo);
                    }
                } else {
                    // Initialize selection state for new item
                    if (data.modifierGroups) {
                        const initialModifiers: Record<string, Record<string, number>> = {};
                        data.modifierGroups.forEach(group => {
                            initialModifiers[group.id] = {};
                        });
                        setSelectedModifiers(initialModifiers);
                    }
                    if (data.comboSteps) {
                        const initialCombo: Record<string, string> = {};
                        data.comboSteps.forEach(step => {
                            initialCombo[step.id] = '';
                        });
                        setSelectedCombo(initialCombo);
                    }
                }
            } else {
                router.push('/kiosk/menu');
            }
            setLoading(false);
        };
        fetchProduct();
    }, [productId, router, editIndex, cart]);

    // Live Pricing Engine
    const totalPrice = useMemo(() => {
        if (!product) return 0;
        let price = product.price;

        // Add modifiers
        if (product.modifierGroups) {
            Object.entries(selectedModifiers).forEach(([groupId, options]) => {
                const group = product.modifierGroups?.find(g => g.id === groupId);
                if (group) {
                    Object.entries(options).forEach(([optionId, qty]) => {
                        const option = group.options.find(o => o.id === optionId);
                        if (option) {
                            price += option.price * qty;
                        }
                    });
                }
            });
        }

        // Add combo option surcharges
        if (product.comboSteps) {
            Object.entries(selectedCombo).forEach(([stepId, optId]) => {
                const step = product.comboSteps?.find(s => s.id === stepId);
                const option = step?.options.find(o => o.id === optId);
                if (option) {
                    price += option.price;
                }
            });
        }

        return price * quantity;
    }, [product, selectedModifiers, selectedCombo, quantity]);

    // Modifier change handler
    const handleModifierToggle = (groupId: string, optionId: string) => {
        if (!product) return;
        const group = product.modifierGroups?.find(g => g.id === groupId);
        if (!group) return;

        setSelectedModifiers(prev => {
            const groupSelection = { ...prev[groupId] };
            const isSelected = !!groupSelection[optionId];

            if (group.maxSelection === 1) {
                // Radio behavior
                return {
                    ...prev,
                    [groupId]: { [optionId]: 1 }
                };
            } else {
                // Checkbox behavior
                if (isSelected) {
                    delete groupSelection[optionId];
                } else {
                    const currentCount = Object.values(groupSelection).reduce((a, b) => a + b, 0);
                    if (currentCount < group.maxSelection) {
                        groupSelection[optionId] = 1;
                    }
                }
                return {
                    ...prev,
                    [groupId]: groupSelection
                };
            }
        });
    };

    const handleQuantityModifierChange = (groupId: string, optionId: string, delta: number) => {
        if (!product) return;
        const group = product.modifierGroups?.find(g => g.id === groupId);
        if (!group) return;

        setSelectedModifiers(prev => {
            const groupSelection = { ...prev[groupId] || {} };
            const currentQty = groupSelection[optionId] || 0;
            const newQty = Math.max(0, currentQty + delta);

            const currentTotalCount = Object.values(groupSelection).reduce((a, b: number) => a + b, 0) - currentQty;

            if (newQty === 0) {
                delete groupSelection[optionId];
            } else if (currentTotalCount + newQty <= group.maxSelection) {
                groupSelection[optionId] = newQty;
            }

            return {
                ...prev,
                [groupId]: groupSelection
            };
        });
    };

    // Validation Engine
    const validate = () => {
        if (!product) return false;
        const errors: string[] = [];
        const invalid: string[] = [];

        // Validate modifiers
        product.modifierGroups?.forEach(group => {
            const selection = selectedModifiers[group.id] || {};
            const count = Object.values(selection).reduce((a, b) => a + b, 0);
            if (group.required && count < group.minSelection) {
                errors.push(`Please select at least ${group.minSelection} from ${group.title}`);
                invalid.push(group.id);
            }
        });

        // Validate combo
        product.comboSteps?.forEach(step => {
            if (step.required && !selectedCombo[step.id]) {
                errors.push(`Please complete ${step.title}`);
                invalid.push(step.id);
            }
        });

        setInvalidGroups(invalid);
        if (errors.length > 0) {
            setValidationError(errors[0] || 'Required selection missing');
            setShowValidationModal(true);
            return false;
        }
        return true;
    };

    const handleAddToOrder = () => {
        if (!product || !validate()) return;

        // Generate human-readable summaries
        const modifierNames: string[] = [];
        Object.entries(selectedModifiers).forEach(([groupId, options]) => {
            const group = product.modifierGroups?.find(g => g.id === groupId);
            Object.entries(options).forEach(([optionId, qty]) => {
                const option = group?.options.find(o => o.id === optionId);
                if (option) {
                    modifierNames.push(`${qty > 1 ? `${qty}x ` : ''}${option.name}`);
                }
            });
        });

        const comboNames: string[] = [];
        Object.entries(selectedCombo).forEach(([stepId, optId]) => {
            const step = product.comboSteps?.find(s => s.id === stepId);
            const option = step?.options.find(o => o.id === optId);
            if (option) {
                comboNames.push(option.name);
            }
        });

        const existingCartId = editIndex !== null ? cart[parseInt(editIndex)]?.id : null;

        const cartItem: CartItem = {
            id: existingCartId || Math.random().toString(36).substr(2, 9),
            productId: product!.id,
            name: product!.name,
            basePrice: product!.price,
            image: product!.image,
            selectedModifiers,
            selectedCombo,
            modifierNames,
            comboNames,
            quantity,
            kitchenNote,
            price: totalPrice / quantity, // Price per unit
            finalTotal: totalPrice,
            type: product!.type === 'pizza' ? 'pizza' : 'item'
        };

        if (editIndex !== null) {
            updateCartItem(parseInt(editIndex), cartItem);
            router.push('/kiosk/cart');
        } else {
            addToCart(cartItem);
            router.push('/kiosk/menu');
        }
    };

    if (loading) return <div className="flex-1 bg-white flex items-center justify-center"><div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;
    if (!product) return null;

    return (
        <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden relative">
            {/* Header */}
            <header className="h-[100px] flex items-center justify-between px-10 border-b border-zinc-100 shrink-0 bg-white z-10">
                <button
                    onClick={() => router.back()}
                    className="p-4 rounded-3xl bg-zinc-100 active:scale-90 transition-transform"
                >
                    <ArrowLeft size={44} className="text-zinc-900" />
                </button>
                <h1 className="text-4xl font-black text-zinc-900 truncate max-w-[500px]">{editIndex ? 'Edit' : 'Customize'} {product.name}</h1>
                <div className="w-[76px]"></div>
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
                {/* Hero Section */}
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                </div>

                <div className="p-10 space-y-12">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-6xl font-black text-zinc-900 leading-tight">{product.name}</h2>
                            <span className="text-5xl font-black text-brand">${product.price.toFixed(2)}</span>
                        </div>
                        <p className="text-2xl text-zinc-400 font-medium leading-relaxed">{product.description}</p>
                        {product.calories && (
                            <div className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-full text-zinc-500 font-bold">
                                <span>{product.calories} kcal</span>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-zinc-100 w-full"></div>

                    {/* Combo Steps */}
                    {product.comboSteps?.map((step) => (
                        <div key={step.id} id={step.id} className={cn("space-y-6 scroll-mt-24 p-6 rounded-[32px] transition-colors", invalidGroups.includes(step.id) && "bg-red-50 border-2 border-red-200")}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-black text-zinc-900">{step.title}</h3>
                                {step.required && (
                                    <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-black uppercase">Required</span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                {step.options.map((opt) => (
                                    <div
                                        key={opt.id}
                                        onClick={() => setSelectedCombo(prev => ({ ...prev, [step.id]: opt.id }))}
                                        className={cn(
                                            "flex flex-col gap-4 p-6 rounded-[32px] border-4 transition-all active:scale-[0.98]",
                                            selectedCombo[step.id] === opt.id
                                                ? "border-brand bg-brand/5"
                                                : "border-zinc-100 bg-white"
                                        )}
                                    >
                                        <div className="aspect-square rounded-2xl overflow-hidden">
                                            <img src={opt.image} className="w-full h-full object-cover" alt={opt.name} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-zinc-900">{opt.name}</span>
                                            {opt.price > 0 && <span className="text-lg font-black text-brand">+${opt.price.toFixed(2)}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Modifier Groups */}
                    {product.modifierGroups?.map((group) => (
                        <div key={group.id} id={group.id} className={cn("space-y-6 scroll-mt-24 p-6 rounded-[32px] transition-colors", invalidGroups.includes(group.id) && "bg-red-50 border-2 border-red-200")}>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <h3 className="text-3xl font-black text-zinc-900">{group.title}</h3>
                                    <p className="text-zinc-400 font-bold">
                                        {group.maxSelection === 1 ? 'Select one' : `Select up to ${group.maxSelection}`}
                                    </p>
                                </div>
                                {group.required && (
                                    <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-black uppercase">Required</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                {group.options.map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => !group.allowQuantity && handleModifierToggle(group.id, option.id)}
                                        className={cn(
                                            "flex items-center justify-between p-8 rounded-[32px] border-4 transition-all active:scale-[0.99]",
                                            selectedModifiers[group.id]?.[option.id]
                                                ? "border-brand bg-brand/5"
                                                : "border-zinc-100 bg-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "w-10 h-10 border-4 rounded-full flex items-center justify-center transition-colors",
                                                selectedModifiers[group.id]?.[option.id] ? "bg-brand border-brand" : "border-zinc-200"
                                            )}>
                                                {selectedModifiers[group.id]?.[option.id] && <Check size={24} className="text-white" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-2xl font-black text-zinc-900">{option.name}</span>
                                                {option.calories && <span className="text-zinc-400 font-bold">{option.calories} kcal</span>}
                                            </div>
                                        </div>

                                        {group.allowQuantity ? (
                                            <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleQuantityModifierChange(group.id, option.id, -1)}
                                                    className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center active:scale-90"
                                                >
                                                    <Minus size={32} />
                                                </button>
                                                <span className="text-3xl font-black w-10 text-center">{selectedModifiers[group.id]?.[option.id] || 0}</span>
                                                <button
                                                    onClick={() => handleQuantityModifierChange(group.id, option.id, 1)}
                                                    className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center active:scale-90"
                                                >
                                                    <Plus size={32} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-2xl font-black text-brand">
                                                {option.price > 0 ? `+$${option.price.toFixed(2)}` : 'FREE'}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Kitchen Note */}
                    <div className="space-y-6">
                        <h3 className="text-3xl font-black text-zinc-900">Special Instructions</h3>
                        <textarea
                            value={kitchenNote}
                            onChange={(e) => setKitchenNote(e.target.value.slice(0, 120))}
                            placeholder="Example: No onions please, extra napkins..."
                            className="w-full h-40 bg-zinc-100 rounded-[32px] p-8 text-2xl font-medium focus:ring-4 focus:ring-brand/20 outline-none resize-none border-none"
                        />
                        <p className="text-right text-zinc-400 font-bold">{kitchenNote.length}/120</p>
                    </div>
                </div>
            </main>

            {/* Sticky Bottom CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-10 bg-white border-t border-zinc-100 flex items-center gap-8 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-6 bg-zinc-100 p-4 rounded-[32px]">
                    <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center active:scale-90 shadow-sm"
                    >
                        <Minus size={40} />
                    </button>
                    <span className="text-4xl font-black w-12 text-center">{quantity}</span>
                    <button
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center active:scale-90 shadow-sm"
                    >
                        <Plus size={40} />
                    </button>
                </div>

                <button
                    onClick={handleAddToOrder}
                    className="flex-1 h-[100px] bg-brand text-white rounded-[40px] flex items-center justify-center gap-4 active:scale-[0.98] transition-transform shadow-[0_20px_40px_rgba(77,190,126,0.3)]"
                >
                    <span className="text-3xl font-black uppercase tracking-widest">{editIndex ? 'Update Order' : 'Add to Order'}</span>
                    <div className="w-1 h-8 bg-white/20 rounded-full"></div>
                    <span className="text-4xl font-black">${totalPrice.toFixed(2)}</span>
                </button>
            </div>

            {/* Validation Modal */}
            {showValidationModal && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-10 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-[800px] bg-white rounded-[60px] p-16 flex flex-col items-center text-center gap-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-32 h-32 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                            <AlertCircle size={80} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-zinc-900">Selection Required</h2>
                            <p className="text-2xl text-zinc-400 font-medium px-8">{validationError}</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowValidationModal(false);
                                const firstInvalid = invalidGroups[0];
                                if (firstInvalid) {
                                    document.getElementById(firstInvalid)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }}
                            className="w-full h-[100px] bg-zinc-900 text-white rounded-[40px] text-3xl font-black uppercase tracking-widest active:scale-[0.98] transition-all"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
