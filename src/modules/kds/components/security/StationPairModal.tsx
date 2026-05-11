'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Monitor, Loader2, AlertCircle, Wifi, CheckCircle2 } from 'lucide-react';
import { pairStation } from '../../services/stationDeviceService';

// ─────────────────────────────────────────────────────────────────────────────
//  Props
// ─────────────────────────────────────────────────────────────────────────────

interface StationPairModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type PairPhase = 'INPUT' | 'CONNECTING' | 'SUCCESS' | 'ERROR';

// ─────────────────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────────────────

export const StationPairModal: React.FC<StationPairModalProps> = ({ isOpen, onClose }) => {
    const [pairingCode, setPairingCode] = useState('');
    const [phase, setPhase] = useState<PairPhase>('INPUT');
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        if (!pairingCode.trim()) {
            setError('Please enter a pairing code.');
            return;
        }

        setPhase('CONNECTING');
        setError(null);

        try {
            await pairStation(pairingCode.trim());
            setPhase('SUCCESS');

            // Brief success feedback, then reload to re-bootstrap with station token
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Pairing failed. Please try again.');
            setPhase('ERROR');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && phase === 'INPUT') {
            handleConnect();
        }
    };

    const handleReset = () => {
        setPairingCode('');
        setError(null);
        setPhase('INPUT');
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={phase !== 'CONNECTING' ? onClose : undefined} />

            {/* Modal */}
            <div
                className="relative w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Success State ─────────────────────────────────────────── */}
                {phase === 'SUCCESS' ? (
                    <div className="flex flex-col items-center text-center py-6 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                            <CheckCircle2 size={40} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                            Station Paired
                        </h2>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            Reloading KDS with station context…
                        </p>
                        <div className="flex gap-1.5 mt-6">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Header ──────────────────────────────────────────── */}
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="relative mb-5">
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                                <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                                    <Monitor size={28} className="text-blue-400" />
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                Station Pairing
                            </h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 max-w-[260px]">
                                Enter the pairing code displayed on the admin console to link this device
                            </p>
                        </div>

                        {/* ── Pairing Code Input ──────────────────────────────── */}
                        <div className="mb-6">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">
                                Pairing Code
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={pairingCode}
                                    onChange={(e) => {
                                        setPairingCode(e.target.value.toUpperCase());
                                        if (error) setError(null);
                                        if (phase === 'ERROR') setPhase('INPUT');
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. KDS-4829"
                                    disabled={phase === 'CONNECTING'}
                                    maxLength={20}
                                    autoFocus
                                    className={`
                                        w-full h-14 bg-slate-950 border-2 rounded-2xl px-5 text-lg font-black text-white
                                        uppercase tracking-[0.2em] text-center placeholder:text-slate-700 placeholder:tracking-widest
                                        outline-none transition-all disabled:opacity-50
                                        ${error
                                            ? 'border-red-500/50 focus:border-red-500'
                                            : 'border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                        }
                                    `}
                                />
                                {phase === 'CONNECTING' && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 size={18} className="text-blue-400 animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Error Message ───────────────────────────────────── */}
                        {error && (
                            <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top-2 duration-200">
                                <AlertCircle size={14} className="text-red-500 shrink-0" />
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                    {error}
                                </span>
                            </div>
                        )}

                        {/* ── Connect Button ──────────────────────────────────── */}
                        <button
                            onClick={phase === 'ERROR' ? handleReset : handleConnect}
                            disabled={phase === 'CONNECTING'}
                            className={`
                                w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest
                                transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                                flex items-center justify-center gap-3 shadow-lg
                                ${phase === 'ERROR'
                                    ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 border-b-4 border-blue-800'
                                }
                            `}
                        >
                            {phase === 'CONNECTING' ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Connecting…
                                </>
                            ) : phase === 'ERROR' ? (
                                'Try Again'
                            ) : (
                                <>
                                    <Wifi size={18} />
                                    Connect Station
                                </>
                            )}
                        </button>

                        {/* ── Cancel ──────────────────────────────────────────── */}
                        <button
                            onClick={onClose}
                            disabled={phase === 'CONNECTING'}
                            className="w-full mt-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors disabled:opacity-30"
                        >
                            Cancel
                        </button>

                        {/* ── Footer Hint ─────────────────────────────────────── */}
                        <div className="mt-6 pt-5 border-t border-slate-800/50 text-center">
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                                Station mode locks this device to the kitchen display.
                                <br />
                                Sensitive actions will require PIN verification.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};
