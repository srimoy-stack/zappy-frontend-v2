'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface ConfirmModalProps {
    /** Whether the modal is visible */
    open: boolean;
    /** Title displayed at top */
    title: string;
    /** Description/message body */
    description: string;
    /** Label for the confirm button */
    confirmLabel?: string;
    /** Label for the cancel button */
    cancelLabel?: string;
    /** Visual variant */
    variant?: 'danger' | 'warning' | 'info';
    /** Whether confirmation is in progress (shows spinner) */
    loading?: boolean;
    /** Called when user confirms */
    onConfirm: () => void;
    /** Called when user cancels or clicks backdrop */
    onCancel: () => void;
}

// ============================================================================
// VARIANT CONFIG
// ============================================================================

const VARIANT_STYLES = {
    danger: {
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        confirmBtn: 'bg-red-600 hover:bg-red-700 shadow-red-200 focus:ring-red-500',
    },
    warning: {
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        confirmBtn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200 focus:ring-amber-500',
    },
    info: {
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 focus:ring-indigo-500',
    },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    loading = false,
    onConfirm,
    onCancel,
}) => {
    const confirmRef = useRef<HTMLButtonElement>(null);
    const styles = VARIANT_STYLES[variant];

    // Focus the cancel button when modal opens for safety
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (open) {
            timer = setTimeout(() => confirmRef.current?.focus(), 50);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [open]);

    // Close on ESC
    useEffect(() => {
        if (!open) return undefined;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onCancel();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, loading, onCancel]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (!open) return undefined;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
                onClick={() => !loading && onCancel()}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-[scaleIn_200ms_ease-out] overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6 pt-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-5">
                        <div className={`p-3.5 rounded-2xl ${styles.iconBg}`}>
                            <AlertTriangle className={`w-7 h-7 ${styles.iconColor}`} />
                        </div>
                    </div>

                    {/* Title */}
                    <h2
                        id="confirm-modal-title"
                        className="text-lg font-bold text-slate-900 text-center"
                    >
                        {title}
                    </h2>

                    {/* Description */}
                    <p className="mt-2 text-sm text-slate-500 text-center leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-2">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg transition-all focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 ${styles.confirmBtn}`}
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        )}
                        {loading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
