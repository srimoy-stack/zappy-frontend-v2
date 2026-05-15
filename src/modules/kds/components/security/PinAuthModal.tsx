'use client';

import { useState, useEffect } from 'react';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { verifyPin } from '../../services/pinAuthService';

/**
 * 4-digit PIN authentication modal for sensitive KDS actions.
 */
export function PinAuthModal({
    isOpen,
    onClose,
    onSuccess,
    actionLabel = 'Authorize Action'
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    actionLabel?: string;
}) {
    const [pin, setPin] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setPin('');
            setError(null);
        }
    }, [isOpen]);

    const handleKeyPress = (num: string) => {
        if (pin.length < 4 && !isVerifying) {
            const newPin = pin + num;
            setPin(newPin);
        }
    };

    const handleConfirm = async () => {
        if (pin.length !== 4) {
            setError('Enter a 4-digit PIN');
            return;
        }

        setIsVerifying(true);
        setError(null);

        try {
            await verifyPin(pin);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Invalid PIN');
            setPin('');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDelete = () => {
        if (!isVerifying) setPin(pin.slice(0, -1));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-[320px] bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                        <Lock size={24} className="text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">{actionLabel}</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Secure Action Authentication
                    </p>
                </div>

                {/* PIN Display */}
                <div className="flex justify-center gap-4 mb-8">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length > i
                                ? 'bg-emerald-400 border-emerald-400 scale-110'
                                : 'border-slate-800 bg-slate-950'
                                }`}
                        />
                    ))}
                </div>

                {/* Num Pad */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                        <button
                            key={num}
                            onClick={() => handleKeyPress(num)}
                            disabled={isVerifying}
                            className="h-14 bg-slate-800/50 hover:bg-slate-700 text-white rounded-2xl font-black text-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {num}
                        </button>
                    ))}
                    <div />
                    <button
                        onClick={() => handleKeyPress('0')}
                        disabled={isVerifying}
                        className="h-14 bg-slate-800/50 hover:bg-slate-700 text-white rounded-2xl font-black text-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        0
                    </button>
                    <button onClick={handleDelete} className="h-14 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>
                    </button>
                </div>

                {error && (
                    <div className="flex items-center justify-center gap-1.5 mb-6 text-red-500 animate-in slide-in-from-top-2">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{error}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleConfirm}
                        disabled={isVerifying || pin.length !== 4}
                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isVerifying && <Loader2 size={16} className="animate-spin" />}
                        Confirm Action
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isVerifying}
                        className="w-full py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors disabled:opacity-30"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
