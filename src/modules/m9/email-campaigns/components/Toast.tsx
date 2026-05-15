'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    title: string;
    description?: string;
    /** Duration in ms before auto-dismiss (default: 4000) */
    duration?: number;
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

// ============================================================================
// VARIANT CONFIG
// ============================================================================

const TOAST_VARIANTS: Record<ToastVariant, {
    bg: string;
    border: string;
    icon: React.ReactNode;
    titleColor: string;
    descColor: string;
    progressColor: string;
}> = {
    success: {
        bg: 'bg-white',
        border: 'border-emerald-200',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        titleColor: 'text-emerald-900',
        descColor: 'text-emerald-600',
        progressColor: 'bg-emerald-500',
    },
    error: {
        bg: 'bg-white',
        border: 'border-red-200',
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        titleColor: 'text-red-900',
        descColor: 'text-red-600',
        progressColor: 'bg-red-500',
    },
    info: {
        bg: 'bg-white',
        border: 'border-indigo-200',
        icon: <Info className="w-5 h-5 text-indigo-500" />,
        titleColor: 'text-indigo-900',
        descColor: 'text-indigo-600',
        progressColor: 'bg-indigo-500',
    },
};

// ============================================================================
// SINGLE TOAST
// ============================================================================

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
    toast,
    onDismiss,
}) => {
    const [exiting, setExiting] = useState(false);
    const duration = toast.duration ?? 4000;
    const styles = TOAST_VARIANTS[toast.variant];

    useEffect(() => {
        const exitTimer = setTimeout(() => setExiting(true), duration - 300);
        const removeTimer = setTimeout(() => onDismiss(toast.id), duration);
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, duration, onDismiss]);

    return (
        <div
            role="alert"
            className={`
                relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl max-w-sm w-full overflow-hidden
                ${styles.bg} ${styles.border}
                ${exiting ? 'animate-[slideOut_300ms_ease-in_forwards]' : 'animate-[slideIn_300ms_ease-out]'}
            `}
        >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">{styles.icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${styles.titleColor}`}>{toast.title}</p>
                {toast.description && (
                    <p className={`text-xs mt-0.5 ${styles.descColor}`}>{toast.description}</p>
                )}
            </div>

            {/* Close */}
            <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                aria-label="Dismiss"
            >
                <X className="w-3.5 h-3.5" />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
                <div
                    className={`h-full ${styles.progressColor} rounded-full`}
                    style={{
                        animation: `shrinkWidth ${duration}ms linear forwards`,
                    }}
                />
            </div>
        </div>
    );
};

// ============================================================================
// TOAST CONTAINER
// ============================================================================

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9998] flex flex-col gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};

// ============================================================================
// HOOK: useToast
// ============================================================================

let toastCounter = 0;

export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((
        variant: ToastVariant,
        title: string,
        description?: string,
        duration?: number,
    ) => {
        const id = `toast-${++toastCounter}-${Date.now()}`;
        setToasts((prev) => [...prev, { id, variant, title, description, duration }]);
    }, []);

    const success = useCallback(
        (title: string, description?: string) => addToast('success', title, description),
        [addToast],
    );

    const error = useCallback(
        (title: string, description?: string) => addToast('error', title, description, 6000),
        [addToast],
    );

    const info = useCallback(
        (title: string, description?: string) => addToast('info', title, description),
        [addToast],
    );

    return { toasts, dismiss, success, error, info };
}

export default ToastContainer;
