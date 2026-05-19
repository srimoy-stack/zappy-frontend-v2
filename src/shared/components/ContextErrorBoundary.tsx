'use client';

/**
 * ContextErrorBoundary — Shows tenant/store missing screens
 * by listening to api:tenant-missing and api:store-missing events.
 */

import React, { useEffect, useState, ReactNode } from 'react';
import { useTenant } from '@/shared/contexts/TenantContext';
import { useStore } from '@/shared/contexts/StoreContext';
import { Building2, MapPin } from 'lucide-react';

export function ContextErrorBoundary({ children }: { children: ReactNode }) {
    const { tenantId } = useTenant();
    const { stores, activeStore, setActiveStore } = useStore();
    const [showStorePicker, setShowStorePicker] = useState(false);

    // Listen for store-missing events
    useEffect(() => {
        function handler() {
            if (!activeStore && stores.length > 0) {
                setShowStorePicker(true);
            }
        }
        window.addEventListener('api:store-missing', handler);
        return () => window.removeEventListener('api:store-missing', handler);
    }, [activeStore, stores]);

    // Store picker modal
    if (showStorePicker && !activeStore && stores.length > 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                            <MapPin className="w-8 h-8 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-xl font-bold text-slate-900">Select a Store</h1>
                            <p className="text-sm text-slate-500">
                                Choose the store you want to work with.
                            </p>
                        </div>
                        <div className="w-full space-y-2">
                            {stores.map((store) => (
                                <button
                                    key={store.id}
                                    onClick={() => {
                                        setActiveStore(store);
                                        setShowStorePicker(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-colors text-left"
                                >
                                    <Building2 className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{store.name}</p>
                                        {store.code && (
                                            <p className="text-xs text-slate-400">{store.code}</p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
