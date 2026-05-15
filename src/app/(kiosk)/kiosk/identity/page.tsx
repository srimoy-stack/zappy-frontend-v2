'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/store/kioskStore';
import { Keypad } from '@/modules/kiosk/components/Keypad';
import { kioskApi } from '@/modules/kiosk/services/kioskApi';
import { ArrowLeft, User, Mail, Phone, History, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function KioskIdentityPage() {
    const router = useRouter();
    const { setIdentity, addToCart } = useKioskStore();

    const [mode, setMode] = useState<'phone' | 'email'>('phone');
    const [inputValue, setInputValue] = useState('');
    const [step, setStep] = useState<'identify' | 'otp'>('identify');
    const [otpValue, setOtpValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [customerData, setCustomerData] = useState<any>(null);

    const handleIdentify = async () => {
        setLoading(true);
        try {
            const res = await kioskApi.identifyCustomer(inputValue);
            if (res.exists) {
                setCustomerData(res.customer);
                setStep('otp');
            } else {
                setIdentity({ id: inputValue, authenticated: false });
                router.push('/kiosk/menu');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        const success = await kioskApi.verifyOtp(inputValue, otpValue);
        if (success && customerData) {
            setIdentity({
                id: inputValue,
                name: customerData.name,
                points: customerData.points,
                authenticated: true
            });
            setCustomerData({ ...customerData, authenticated: true });
        }
        setLoading(false);
    };

    const handleQuickAdd = (order: any) => {
        order.items.forEach((item: any) => {
            addToCart({
                ...item,
                id: Math.random().toString(36).substr(2, 9),
            });
        });
        router.push('/kiosk/menu');
    };

    return (
        <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden">
            {/* Header */}
            <header className="h-[120px] flex items-center justify-between px-10 shrink-0">
                <button
                    onClick={() => step === 'otp' ? setStep('identify') : router.push('/kiosk/start')}
                    className="p-4 rounded-3xl bg-zinc-50 active:scale-90 transition-transform"
                >
                    <ArrowLeft size={44} className="text-zinc-900" />
                </button>
                <div className="flex items-center gap-4">
                    <History size={32} className="text-brand" />
                    <span className="text-2xl font-black uppercase tracking-widest text-zinc-400">Loyalty Rewards</span>
                </div>
                <div className="w-16"></div>
            </header>

            <main className="flex-1 flex flex-col items-center px-12 pb-12 overflow-y-auto">
                <div className="w-full max-w-4xl space-y-12">
                    {/* Progress Indicator */}
                    <div className="flex justify-center gap-3">
                        <div className={cn("h-3 w-12 rounded-full", step === 'identify' ? "bg-brand" : "bg-zinc-100")}></div>
                        <div className={cn("h-3 w-12 rounded-full", step === 'otp' ? "bg-brand" : "bg-zinc-100")}></div>
                    </div>

                    {step === 'identify' ? (
                        <div className="space-y-12 animate-in slide-in-from-bottom duration-500">
                            <div className="text-center space-y-4">
                                <h1 className="text-6xl font-black text-zinc-900 tracking-tighter">Welcome Back!</h1>
                                <p className="text-2xl text-zinc-500 font-bold">Enter your details to earn points & see favorites.</p>
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex bg-zinc-100 p-3 rounded-[32px] w-full max-w-2xl mx-auto shadow-inner">
                                <button
                                    onClick={() => { setMode('phone'); setInputValue(''); }}
                                    className={cn(
                                        "flex-1 py-5 rounded-[24px] text-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                        mode === 'phone' ? "bg-white text-brand shadow-lg scale-105" : "text-zinc-400"
                                    )}
                                >
                                    <Phone size={24} /> Phone
                                </button>
                                <button
                                    onClick={() => { setMode('email'); setInputValue(''); }}
                                    className={cn(
                                        "flex-1 py-5 rounded-[24px] text-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                        mode === 'email' ? "bg-white text-brand shadow-lg scale-105" : "text-zinc-400"
                                    )}
                                >
                                    <Mail size={24} /> Email
                                </button>
                            </div>

                            <div className="flex flex-col items-center gap-12">
                                <div className="text-center">
                                    <div className="text-7xl font-black text-zinc-900 tracking-widest h-20 flex items-center justify-center border-b-8 border-brand/20 px-8">
                                        {inputValue || (mode === 'phone' ? '000-000-0000' : 'name@example.com')}
                                    </div>
                                </div>

                                {mode === 'phone' ? (
                                    <Keypad
                                        onPress={(val) => {
                                            if (inputValue.length < 10) setInputValue(prev => prev + val);
                                        }}
                                        onDelete={() => setInputValue(prev => prev.slice(0, -1))}
                                        onClear={() => setInputValue('')}
                                    />
                                ) : (
                                    <div className="w-full grid grid-cols-3 gap-4">
                                        {['@gmail.com', '@outlook.com', '@yahoo.com'].map(ext => (
                                            <button
                                                key={ext}
                                                onClick={() => setInputValue(prev => prev + ext)}
                                                className="py-6 bg-zinc-50 rounded-3xl text-xl font-bold border-2 border-transparent active:border-brand transition-all"
                                            >
                                                {ext}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <button
                                    disabled={loading || inputValue.length < 5}
                                    onClick={handleIdentify}
                                    className={cn(
                                        "w-full py-10 rounded-[40px] text-4xl font-black uppercase tracking-[0.2em] transition-all shadow-2xl",
                                        loading || inputValue.length < 5
                                            ? "bg-zinc-100 text-zinc-300"
                                            : "bg-brand text-white shadow-brand/20 active:scale-95"
                                    )}
                                >
                                    {loading ? 'Searching...' : 'Continue'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12 animate-in slide-in-from-right duration-500">
                            {!customerData?.authenticated ? (
                                <div className="space-y-12">
                                    <div className="text-center space-y-4">
                                        <h1 className="text-6xl font-black text-zinc-900 tracking-tighter">Verify It's You</h1>
                                        <p className="text-2xl text-zinc-500 font-bold">We sent a 4-digit code to <span className="text-brand"> {inputValue} </span></p>
                                    </div>

                                    <div className="flex justify-center">
                                        <Keypad
                                            onPress={(val) => {
                                                if (otpValue.length < 4) setOtpValue(prev => prev + val);
                                            }}
                                            onDelete={() => setOtpValue(prev => prev.slice(0, -1))}
                                            onClear={() => setOtpValue('')}
                                        />
                                    </div>

                                    <button
                                        onClick={handleVerifyOtp}
                                        className="w-full py-10 bg-zinc-900 text-white rounded-[40px] text-4xl font-black uppercase tracking-[0.2em] active:scale-95 shadow-2xl"
                                    >
                                        Confirm & Unlock
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-32 h-32 bg-brand rounded-full flex items-center justify-center shadow-2xl">
                                            <User size={64} className="text-white" />
                                        </div>
                                        <div className="text-center">
                                            <h2 className="text-5xl font-black text-zinc-900">Hi, {customerData.name}!</h2>
                                            <div className="mt-2 bg-brand/10 px-6 py-2 rounded-full inline-block">
                                                <span className="text-2xl font-black text-brand">{customerData.points} Points Available</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <h3 className="text-2xl font-black uppercase tracking-widest text-zinc-400">One-Tap Reorder (Quick-Add)</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            {customerData.pastOrders?.map((order: any, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleQuickAdd(order)}
                                                    className="bg-zinc-50 p-8 rounded-[48px] border-4 border-transparent hover:border-brand text-left transition-all active:scale-95 group shadow-xl shadow-zinc-200/20"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:bg-brand transition-colors">
                                                            <Plus size={32} className="text-brand group-hover:text-white" />
                                                        </div>
                                                        <span className="text-zinc-300 font-bold italic">{order.date}</span>
                                                    </div>
                                                    <p className="text-2xl font-black text-zinc-900 line-clamp-2 leading-tight">
                                                        {order.items.map((it: any) => it.name).join(' & ')}
                                                    </p>
                                                    <span className="text-xl font-bold text-brand mt-4 block">${order.total}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push('/kiosk/menu')}
                                        className="w-full py-8 text-2xl font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 rounded-[32px] active:scale-95"
                                    >
                                        Go to New Menu
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Sticky Bottom Skip Button - Popeyes Alignment */}
            <div className="p-10 bg-white border-t border-zinc-100 mt-auto">
                <button
                    onClick={() => {
                        setIdentity({ id: 'guest', authenticated: false });
                        router.push('/kiosk/menu');
                    }}
                    className="w-full py-10 bg-zinc-900 text-white rounded-[40px] text-4xl font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                >
                    Order as Guest
                </button>
            </div>
        </div>
    );
}
