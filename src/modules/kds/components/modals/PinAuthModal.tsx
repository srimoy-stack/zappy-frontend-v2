'use client';

import { useState, useEffect } from 'react';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { verifyPin } from '../../services/mockPinAuthService';

/**
 * PIN-based authentication modal for sensitive KDS actions.
 * Prompts the user for a 4-digit PIN before allowing an action.
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

    // Clear PIN when modal opens/closes
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

            // Auto-submit if 4 digits
            if (newPin.length === 4) {
                // Trigger verification with the new PIN
                setTimeout(() => triggerAutoVerify(newPin), 100);
            }
        }
    };

    const triggerAutoVerify = async (val: string) => {
        setIsVerifying(true);
        setError(null);
        try {
            await verifyPin(val);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid PIN');
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-[320px] bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                        <Lock size={24} className="text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                        {actionLabel}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Enter your 4-digit PIN
                    </p>
                </div>

                {/* PIN Indicators */}
                <div className="flex justify-center gap-4 mb-10">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${pin.length > i
                                ? 'bg-emerald-400 border-emerald-400 scale-110'
                                : (error ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-950')
                                }`}
                        />
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center justify-center gap-1.5 mb-6 text-red-500 animate-in slide-in-from-top-2 duration-200">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{error}</span>
                    </div>
                )}

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
                    <button
                        onClick={handleDelete}
                        disabled={isVerifying}
                        className="h-14 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>
                    </button>
                </div>

                {/* Actions */}
                <button
                    onClick={onClose}
                    className="w-full py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                    Cancel
                </button>
            </div>

            {isVerifying && (
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center backdrop-blur-[2px] z-10 rounded-[2.5rem]">
                    <Loader2 className="text-emerald-400 animate-spin" size={32} />
                </div>
            )}
        </div>
    );
}
