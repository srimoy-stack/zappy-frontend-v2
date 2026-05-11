'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckoutForm } from '@/modules/shop/components/CheckoutForm';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/modules/shop/context/CartContext';
import { shopService } from '@/modules/shop/services/shopService';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { cartItems, removeFromCart, clearCart } = useCart();
    const itemId = searchParams.get('itemId');

    useEffect(() => {
        if (cartItems.length === 0 && !itemId) {
            router.push('/backoffice/shop');
        }
    }, [cartItems, itemId, router]);

    const handleSuccess = async (email: string) => {
        const orderId = await shopService.createOrderFromCart(cartItems, email);
        clearCart();
        router.push(`/backoffice/shop/success?orderId=${orderId}`);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-7xl mx-auto space-y-16 pb-20 px-4">
            {/* Extended Header */}
            <div className="text-center space-y-8 py-8">
                <div className="flex flex-col items-center gap-6">
                    <Link href="/backoffice/shop" className="group inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-all">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Continue Enterprise Selection
                    </Link>
                    <div className="flex items-center gap-4 bg-emerald-50 px-6 py-2 rounded-2xl border border-emerald-100/50">
                        <Lock className="text-emerald-600" size={16} />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Military Grade Encryption Active</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-8xl font-black text-slate-900 tracking-tighter leading-[0.8] mb-4">Checkout.</h1>
                    <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto">
                        Finalize your procurement details and authorize the transaction to initiate fulfillment.
                    </p>
                </div>
            </div>

            <CheckoutForm
                items={cartItems}
                onSuccess={handleSuccess}
                onRemove={removeFromCart}
            />
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[700px] gap-8">
                <div className="relative">
                    <Loader2 className="animate-spin text-emerald-600 w-16 h-16" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={16} className="text-emerald-600/30" />
                    </div>
                </div>
                <div className="space-y-3 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Establishing Secure Gateway</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase">Synchronizing order manifest with global servers...</p>
                </div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
