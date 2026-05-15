'use client';

import React, { useState } from 'react';
import { X, Send, Mail, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface TestSendModalProps {
    open: boolean;
    onClose: () => void;
    campaignName: string;
    onSend: (email: string) => Promise<void>;
}

export const TestSendModal: React.FC<TestSendModalProps> = ({
    open,
    onClose,
    campaignName,
    onSend,
}) => {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || sending) return;

        setSending(true);
        setStatus('idle');
        try {
            await onSend(email);
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setEmail('');
            }, 2000);
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.message || 'Operation failed');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => !sending && onClose()}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                <header className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white">
                            <Send size={18} />
                        </div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Send Test Email</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={sending}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="p-8">
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                            <Mail className="text-indigo-600 w-8 h-8" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">Verify Layout for "{campaignName}"</h3>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">Send a real email to check how it looks in your specific inbox client.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Destination Address</label>
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. yourname@example.com"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 border-indigo-100/50 outline-none transition-all placeholder:text-slate-300"
                                disabled={sending || status === 'success'}
                            />
                        </div>

                        {status === 'error' && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 animate-in shake duration-300">
                                <AlertCircle size={18} />
                                <span className="text-xs font-bold uppercase tracking-tight">{errorMsg}</span>
                            </div>
                        )}

                        {status === 'success' ? (
                            <div className="p-6 bg-emerald-50 rounded-2xl flex flex-col items-center gap-2 text-emerald-700 animate-in zoom-in-95 duration-300">
                                <CheckCircle2 size={32} />
                                <span className="text-sm font-black uppercase tracking-widest text-center mt-2">Test Dispatch Successful!</span>
                                <p className="text-[10px] uppercase font-bold text-emerald-600/70 tracking-tighter">Check your inbox in a few moments</p>
                            </div>
                        ) : (
                            <button
                                type="submit"
                                disabled={sending || !email}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Transmitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        <span>Fuel the Jets & Send</span>
                                    </>
                                )}
                            </button>
                        )}
                    </form>
                </div>
                
                <footer className="px-8 py-4 bg-slate-50 border-t border-slate-100">
                     <p className="text-[10px] text-slate-400 font-bold border-l-2 border-indigo-500/30 pl-3 leading-relaxed">
                        Note: Test emails will use live data placeholders where possible, or fallback to demo tokens.
                     </p>
                </footer>
            </div>
        </div>
    );
};

export default TestSendModal;
