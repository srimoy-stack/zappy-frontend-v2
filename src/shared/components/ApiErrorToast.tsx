'use client';

/**
 * ApiErrorToast — Listens to `api:error` window events and renders toast notifications.
 *
 * Mount once in root layout.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, X, ShieldAlert, WifiOff } from 'lucide-react';
import { API_ERROR_CODES } from '@/shared/types/api';

interface Toast {
    id: string;
    code: string;
    message: string;
    status: number;
    timestamp: number;
}

const TOAST_DURATION = 5000;
const MAX_TOASTS = 3;

export function ApiErrorToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const addToast = useCallback((detail: { code: string; message: string; status: number }) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const toast: Toast = { id, ...detail, timestamp: Date.now() };

        setToasts((prev) => {
            const next = [...prev, toast];
            return next.slice(-MAX_TOASTS);
        });

        const timer = setTimeout(() => removeToast(id), TOAST_DURATION);
        timers.current.set(id, timer);
    }, [removeToast]);

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.message) {
                addToast(detail);
            }
        };

        window.addEventListener('api:error', handler);
        return () => window.removeEventListener('api:error', handler);
    }, [addToast]);

    // Cleanup all timers on unmount
    useEffect(() => {
        return () => {
            timers.current.forEach((timer) => clearTimeout(timer));
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-4 flex items-start gap-3 animate-in slide-in-from-right-5 fade-in duration-300"
                >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getIconStyle(toast.code)}`}>
                        {getIcon(toast.code)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                            {getLabel(toast.code)}
                        </p>
                        <p className="text-xs font-bold text-slate-700 leading-relaxed break-words">
                            {toast.message}
                        </p>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="p-1.5 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}

function getIconStyle(code: string): string {
    switch (code) {
        case API_ERROR_CODES.FORBIDDEN:
            return 'bg-red-50 text-red-500';
        case API_ERROR_CODES.NETWORK:
        case API_ERROR_CODES.TIMEOUT:
            return 'bg-amber-50 text-amber-500';
        case API_ERROR_CODES.VALIDATION:
            return 'bg-blue-50 text-blue-500';
        default:
            return 'bg-slate-100 text-slate-500';
    }
}

function getIcon(code: string) {
    switch (code) {
        case API_ERROR_CODES.FORBIDDEN:
            return <ShieldAlert className="w-4 h-4" />;
        case API_ERROR_CODES.NETWORK:
        case API_ERROR_CODES.TIMEOUT:
            return <WifiOff className="w-4 h-4" />;
        default:
            return <AlertCircle className="w-4 h-4" />;
    }
}

function getLabel(code: string): string {
    switch (code) {
        case API_ERROR_CODES.FORBIDDEN: return 'Access Denied';
        case API_ERROR_CODES.NETWORK: return 'Network Error';
        case API_ERROR_CODES.TIMEOUT: return 'Timeout';
        case API_ERROR_CODES.VALIDATION: return 'Validation Error';
        case API_ERROR_CODES.SERVER: return 'Server Error';
        default: return 'Error';
    }
}
