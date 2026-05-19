'use client';

/**
 * PermissionDeniedToast — Global listener for API 403 errors.
 *
 * Place once in the provider tree. Listens for 'api:permission-denied'
 * events dispatched by the apiClient interceptor and shows a toast.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface ToastItem {
    id: number;
    message: string;
}

let nextId = 0;

export function PermissionDeniedToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        function handler(e: Event) {
            const detail = (e as CustomEvent).detail;
            const id = ++nextId;
            setToasts((prev) => [...prev, { id, message: detail?.message || 'Access Denied' }]);
            // Auto-dismiss after 5s
            setTimeout(() => dismiss(id), 5000);
        }

        window.addEventListener('api:permission-denied', handler);
        return () => window.removeEventListener('api:permission-denied', handler);
    }, [dismiss]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right duration-300 max-w-sm"
                >
                    <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm font-medium flex-1">{toast.message}</p>
                    <button onClick={() => dismiss(toast.id)} className="text-red-400 hover:text-red-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
