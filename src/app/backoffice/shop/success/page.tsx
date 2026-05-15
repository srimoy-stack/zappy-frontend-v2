'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Printer, Mail, Loader2, PartyPopper, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/modules/shop/context/ToastContext';

function SuccessContent() {
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || 'ORD-0000';
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        showToast('Generating high-resolution receipt PDF...', 'info');
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
            showToast('Receipt generated successfully', 'success');
        }, 1500);
    };

    const handleEmail = () => {
        showToast('Official confirmation email dispatched', 'success');
    };

    return (
        <div className="animate-in zoom-in duration-1000 max-w-4xl mx-auto py-20 px-4">
            <div className="bg-white rounded-[5rem] border border-slate-100 shadow-[0_50px_100px_rgba(0,0,0,0.05)] p-16 md:p-24 text-center space-y-12 relative overflow-hidden">
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] -mr-64 -mt-64 opacity-60 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] -ml-64 -mb-64 opacity-40" />

                <div className="relative space-y-10">
                    <div className="flex justify-center">
                        <div className="w-32 h-32 bg-emerald-500 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-emerald-200 animate-bounce group">
                            <CheckCircle2 className="text-white w-16 h-16 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3">
                            <PartyPopper className="text-amber-500" size={24} />
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-[0.3em]">Transaction Verified</span>
                        </div>
                        <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">Success.</h1>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mx-auto">
                            Your order has been authorized and is currently being processed by our fulfillment engine.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100">
                        <div className="text-left space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Identifier</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tight">{orderId}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <Mail className="text-emerald-600" size={20} />
                            </div>
                            <p className="text-[10px] font-black uppercase text-slate-900">Email Dispatched</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Completion</p>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">48 Hours</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <button
                            onClick={handleEmail}
                            className="p-8 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-4 group hover:border-emerald-500 transition-all shadow-sm"
                        >
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Mail size={24} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Resend Confirmation</p>
                        </button>

                        <button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="p-8 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-4 group hover:border-emerald-500 transition-all shadow-sm"
                        >
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                {isPrinting ? <Loader2 className="animate-spin" size={24} /> : <Printer size={24} />}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Print Receipt</p>
                        </button>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(orderId);
                                showToast('Order ID copied', 'info');
                            }}
                            className="p-8 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-4 group hover:border-emerald-500 transition-all shadow-sm"
                        >
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <Share2 size={24} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Share Order</p>
                        </button>

                        <Link
                            href="/backoffice/shop"
                            className="p-8 bg-emerald-600 rounded-[2.5rem] flex flex-col items-center gap-4 group hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100"
                        >
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                                <ArrowRight size={24} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Back to Market</p>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    nav, header, footer, button, .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
                <Loader2 className="animate-spin text-emerald-600 w-12 h-12" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Finalizing Transaction Data</p>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
