'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/store/kioskStore';
import { CheckCircle2, Receipt } from 'lucide-react';

export default function KioskSuccessPage() {
    const router = useRouter();
    const { resetSession, kitchenQueueCount, identity } = useKioskStore();
    const [countdown, setCountdown] = useState(20);

    const orderNumber = Math.floor(100 + Math.random() * 900);
    const eta = kitchenQueueCount * 5;

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleReturn();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleReturn = () => {
        resetSession();
        router.push('/kiosk/start');
    };

    return (
        <div className="flex-1 flex flex-col bg-brand p-12 text-white items-center justify-center text-center space-y-12 h-screen overflow-hidden">
            <div className="space-y-6 animate-in zoom-in duration-700">
                <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-md">
                    <CheckCircle2 size={120} className="text-white" />
                </div>
                <h1 className="text-7xl font-black uppercase tracking-widest">Order Success!</h1>
                <p className="text-3xl font-medium text-white/80">
                    Thank you for your order. We're starting on it right now.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                <div className="bg-white/10 backdrop-blur-md rounded-[48px] p-10 flex flex-col items-center space-y-4 border border-white/20">
                    <span className="text-xl font-bold uppercase tracking-widest text-white/60">Order Number</span>
                    <span className="text-8xl font-black">#{orderNumber}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-[48px] p-10 flex flex-col items-center space-y-4 border border-white/20">
                    <span className="text-xl font-bold uppercase tracking-widest text-white/60">Est. Ready In</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-8xl font-black">{eta}</span>
                        <span className="text-3xl font-black uppercase">mins</span>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 rounded-[40px] px-12 py-8 flex items-center gap-8 max-w-2xl border border-white/10">
                <Receipt size={64} className="text-white/40" />
                <p className="text-2xl font-bold text-left leading-tight">
                    A copy of your receipt has been sent to <br />
                    <span className="text-white">{identity?.id || 'your phone'}</span>
                </p>
            </div>

            <div className="pt-12 space-y-6">
                <button
                    onClick={handleReturn}
                    className="px-16 py-8 bg-white text-brand rounded-[32px] text-3xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                >
                    Finish
                </button>
                <p className="text-white/60 text-xl font-bold uppercase tracking-widest">
                    Auto-return in {countdown}s
                </p>
            </div>

            {/* Decorative background elements */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
        </div>
    );
}
