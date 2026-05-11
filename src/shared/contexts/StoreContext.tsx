'use client';

/**
 * StoreContext — Active store management.
 *
 * Stores come from /me. Active store persisted in sessionStorage.
 * Exposes getStoreId() for API header injection.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface StoreStub {
    id: string;
    name: string;
    code?: string;
}

interface StoreContextValue {
    stores: StoreStub[];
    activeStore: StoreStub | null;
    setActiveStore: (store: StoreStub) => void;
    setStores: (stores: StoreStub[]) => void;
    getStoreId: () => string | null;
}

const StoreContext = createContext<StoreContextValue>({
    stores: [],
    activeStore: null,
    setActiveStore: () => {},
    setStores: () => {},
    getStoreId: () => null,
});

const SESSION_KEY = 'zyappy_active_store';

function loadPersistedStore(): StoreStub | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function StoreProvider({ children }: { children: ReactNode }) {
    const [stores, setStoresState] = useState<StoreStub[]>([]);
    const [activeStore, setActiveStoreState] = useState<StoreStub | null>(loadPersistedStore);

    const setActiveStore = useCallback((store: StoreStub) => {
        setActiveStoreState(store);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(store));
        }
    }, []);

    const setStores = useCallback((newStores: StoreStub[]) => {
        setStoresState(newStores);
        // Auto-select first store if none active
        if (!activeStore && newStores.length > 0) {
            const persisted = loadPersistedStore();
            const match = persisted ? newStores.find((s) => s.id === persisted.id) : null;
            setActiveStore(match || newStores[0]!);
        }
    }, [activeStore, setActiveStore]);

    const getStoreId = useCallback(() => activeStore?.id ?? null, [activeStore]);

    return (
        <StoreContext.Provider value={{
            stores,
            activeStore,
            setActiveStore,
            setStores,
            getStoreId,
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    return useContext(StoreContext);
}

export { StoreContext };
