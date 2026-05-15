'use client';

/**
 * KDSToast — Lightweight self-contained toast system for KDS.
 *
 * No external library needed. Designed for the dark KDS environment.
 *
 * Usage (imperative API from anywhere):
 *   import { kdsToast } from './KDSToast';
 *   kdsToast.error('Printer not ready. Check connection.');
 *   kdsToast.success('Receipt sent to printer.');
 *   kdsToast.info('Order syncing...');
 *
 * Mount <KDSToastContainer /> once at the KDS layout root.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X, Printer } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export type KDSToastType = 'success' | 'error' | 'info' | 'print_error';

export interface KDSToastItem {
    id: string;
    type: KDSToastType;
    message: string;
    durationMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Singleton queue (event-bus pattern — no React context needed)
// ─────────────────────────────────────────────────────────────────────────────

type ToastListener = (toast: KDSToastItem) => void;
const _listeners: Set<ToastListener> = new Set();

function _broadcast(toast: KDSToastItem) {
    _listeners.forEach(fn => fn(toast));
}

/** Imperative toast API — call from services, stores, or components */
export const kdsToast = {
    success(message: string, durationMs = 3500) {
        _broadcast({ id: crypto.randomUUID(), type: 'success', message, durationMs });
    },
    error(message: string, durationMs = 5000) {
        _broadcast({ id: crypto.randomUUID(), type: 'error', message, durationMs });
    },
    info(message: string, durationMs = 3000) {
        _broadcast({ id: crypto.randomUUID(), type: 'info', message, durationMs });
    },
    printError(message: string, durationMs = 6000) {
        _broadcast({ id: crypto.randomUUID(), type: 'print_error', message, durationMs });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Individual Toast item
// ─────────────────────────────────────────────────────────────────────────────

const TOAST_STYLES: Record<KDSToastType, { bg: string; border: string; icon: React.ReactNode }> = {
    success: {
        bg: 'bg-slate-900',
        border: 'border-green-500',
        icon: <CheckCircle2 size={18} className="text-green-400 shrink-0" />,
    },
    error: {
        bg: 'bg-slate-900',
        border: 'border-red-500',
        icon: <XCircle size={18} className="text-red-400 shrink-0" />,
    },
    info: {
        bg: 'bg-slate-900',
        border: 'border-[#1FA4A9]',
        icon: <Info size={18} className="text-[#1FA4A9] shrink-0" />,
    },
    print_error: {
        bg: 'bg-slate-900',
        border: 'border-amber-400',
        icon: <Printer size={18} className="text-amber-400 shrink-0" />,
    },
};

interface ToastItemProps {
    toast: KDSToastItem;
    onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    // Animate in
    useEffect(() => {
        const t = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(t);
    }, []);

    // Auto-dismiss
    useEffect(() => {
        const out = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
        }, toast.durationMs);
        return () => clearTimeout(out);
    }, [toast.id, toast.durationMs, onDismiss]);

    const style = TOAST_STYLES[toast.type];

    return (
        <div
            className={`
                flex items-start gap-3 w-[380px] px-5 py-4 rounded-xl border-l-4 shadow-2xl
                transition-all duration-300
                ${style.bg} ${style.border}
                ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
            `}
            role="alert"
        >
            {style.icon}
            <p className="flex-1 text-sm font-bold text-white leading-snug">
                {toast.message}
            </p>
            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(() => onDismiss(toast.id), 300);
                }}
                className="p-0.5 text-slate-500 hover:text-white transition-colors shrink-0 mt-0.5"
            >
                <X size={14} />
            </button>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Container — mount once in KDS layout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mount this at the KDS layout root (inside a relative/fixed ancestor).
 * It listens to the singleton queue and renders active toasts.
 */
export const KDSToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<KDSToastItem[]>([]);

    const addToast = useCallback((toast: KDSToastItem) => {
        setToasts(prev => [...prev, toast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        _listeners.add(addToast);
        return () => { _listeners.delete(addToast); };
    }, [addToast]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onDismiss={removeToast} />
                </div>
            ))}
        </div>
    );
};
