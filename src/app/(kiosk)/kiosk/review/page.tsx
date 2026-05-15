'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/store/kioskStore';
import { ArrowLeft, CreditCard, Apple, CheckCircle2, X, Printer } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function KioskReviewPage() {
    const router = useRouter();
    const {
        cart,
        totals,
        orderType,
        setOrderType,
        removeCartItem,
        setPaymentStatus
    } = useKioskStore();

    const [isProcessing, setIsProcessing] = useState(false);
    const [printerError, setPrinterError] = useState(false);

    const handlePayNow = async () => {
        // Mock Hardware Handshake: Receipt Printer Check
        const printerHasPaper = Math.random() > 0.1; // 90% success

        if (!printerHasPaper) {
            setPrinterError(true);
            return;
        }

        setIsProcessing(true);
        setPaymentStatus('processing', 'Please follow instructions on the card reader.');

        // Simulating POS API + Terminal Handshake
        await new Promise(resolve => setTimeout(resolve, 3000));

        setPaymentStatus('success', 'Payment Successful!');
        setTimeout(() => {
            router.push('/kiosk/success');
        }, 800);
    };

    if (cart.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-screen bg-white">
                <div className="w-48 h-48 bg-zinc-50 rounded-full flex items-center justify-center mb-10">
                    <CheckCircle2 size={100} className="text-zinc-200" />
                </div>
                <h1 className="text-5xl font-black text-zinc-900 mb-6">Your order is empty</h1>
                <button
                    onClick={() => router.push('/kiosk/menu')}
                    className="px-12 py-6 bg-brand text-white rounded-full font-black text-2xl uppercase tracking-widest shadow-xl shadow-brand/20 active:scale-95 transition-all"
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-zinc-100 h-screen overflow-hidden relative">
            {/* Header - Matching Ref Style */}
            <header className="h-[120px] flex items-center justify-center px-10 bg-white shrink-0 relative">
                <button
                    onClick={() => router.push('/kiosk/menu')}
                    className="absolute left-10 p-4 rounded-3xl bg-zinc-50 active:scale-90 transition-transform"
                    disabled={isProcessing}
                >
                    <ArrowLeft size={44} className="text-zinc-900" />
                </button>
                <h1 className="text-5xl font-black text-zinc-900 uppercase tracking-tighter">My Order</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-12 pb-64">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Order Type UI */}
                    <div className="flex bg-white p-4 rounded-[40px] shadow-xl shadow-zinc-200/50">
                        {(['dine-in', 'to-go'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setOrderType(type)}
                                disabled={isProcessing}
                                className={cn(
                                    "flex-1 py-8 rounded-[32px] text-2xl font-black uppercase tracking-widest transition-all",
                                    orderType === type
                                        ? "bg-brand text-white shadow-lg scale-105"
                                        : "text-zinc-400"
                                )}
                            >
                                {type === 'dine-in' ? '🍜 Dine In' : '🥡 To Go'}
                            </button>
                        ))}
                    </div>

                    {/* Items List - Ref Style */}
                    <div className="space-y-6">
                        {cart.map((item, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-[48px] shadow-xl shadow-zinc-200/30 flex justify-between items-center group relative overflow-hidden">
                                <div className="flex gap-10 items-center">
                                    <div className="w-32 h-32 bg-zinc-50 rounded-[32px] overflow-hidden shadow-inner">
                                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-zinc-900 leading-tight">{item.name}</h3>
                                        {item.toppings && item.toppings.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {item.toppings.map((t, i) => (
                                                    <span key={i} className="bg-zinc-100 px-3 py-1 rounded-full text-zinc-500 font-bold text-sm">
                                                        {t.name} ({t.zone})
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-zinc-400 font-bold text-xl">Standard Prep</p>
                                        )}
                                        {item.quantity > 1 && (
                                            <span className="inline-block bg-brand/10 text-brand px-4 py-1 rounded-full font-black text-lg">
                                                Qty: {item.quantity}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <span className="text-4xl font-black text-zinc-900">${item.finalTotal.toFixed(2)}</span>
                                    <button
                                        onClick={() => removeCartItem(idx)}
                                        className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-transform shadow-lg"
                                    >
                                        <X size={32} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Block - Popeyes Style */}
                    <div className="bg-white rounded-[48px] p-12 shadow-2xl border-2 border-zinc-50 space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-3xl font-black text-zinc-400 uppercase tracking-widest">Sub-total</span>
                                <span className="text-3xl font-black text-zinc-900">${totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-3xl font-black text-zinc-400 uppercase tracking-widest">Tax (HST)</span>
                                <span className="text-3xl font-black text-zinc-900">${totals.tax.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="h-px bg-zinc-100"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-5xl font-black text-zinc-900 uppercase tracking-tighter">Total</span>
                            <span className="text-7xl font-black text-brand">${totals.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Actions Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-12 bg-white flex gap-6 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] border-t border-zinc-100">
                <button
                    onClick={() => router.push('/kiosk/menu')}
                    disabled={isProcessing}
                    className="flex-1 h-[110px] bg-white border-4 border-zinc-100 text-zinc-400 rounded-[40px] text-3xl font-black uppercase tracking-widest active:scale-[0.98] transition-all shadow-lg"
                >
                    Order More
                </button>
                <button
                    onClick={handlePayNow}
                    disabled={isProcessing}
                    className="flex-[2] h-[110px] bg-brand text-white rounded-[40px] flex items-center justify-center gap-8 shadow-[0_20px_60px_rgba(77,190,126,0.4)] active:scale-[0.98] transition-all"
                >
                    <span className="text-4xl font-black uppercase tracking-[0.1em]">Confirm & Pay</span>
                    <div className="w-2 h-10 bg-white/20 rounded-full"></div>
                    <span className="text-5xl font-black">${totals.total.toFixed(2)}</span>
                </button>
            </div>

            {/* Payment Modal Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-12 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white rounded-[60px] p-20 w-full max-w-5xl shadow-2xl flex flex-col items-center text-center space-y-16">
                        <h2 className="text-7xl font-black text-zinc-900 uppercase">Follow Instructions</h2>
                        <p className="text-4xl text-zinc-500 font-bold max-w-3xl leading-snug">
                            Please follow the instructions on the card terminal to complete your payment.
                        </p>

                        <div className="flex gap-16 items-center">
                            <div className="p-14 bg-zinc-50 rounded-[48px] animate-pulse">
                                <CreditCard size={140} className="text-zinc-600" />
                            </div>
                            <div className="w-16 h-16 border-[12px] border-zinc-100 border-t-brand rounded-full animate-spin"></div>
                            <div className="p-14 bg-zinc-50 rounded-[48px] animate-pulse delay-300">
                                <Apple size={140} className="text-zinc-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Printer Error Modal */}
            {printerError && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-12 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white rounded-[48px] p-16 w-full max-w-3xl shadow-2xl text-center space-y-12">
                        <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <Printer size={64} className="text-red-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-zinc-900">Printer Unavailable</h2>
                            <p className="text-2xl text-zinc-500 font-bold">
                                We are out of receipt paper. Please alert a staff member to continue.
                            </p>
                        </div>
                        <button
                            onClick={() => setPrinterError(false)}
                            className="w-full py-8 bg-zinc-900 text-white rounded-[32px] text-2xl font-black uppercase tracking-widest"
                        >
                            Retry Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
