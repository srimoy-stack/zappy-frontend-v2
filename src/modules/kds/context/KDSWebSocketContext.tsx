'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import {
    configureDispatcher,
    setWebSocketEmitter,
    subscribeToEvents,
    emitEvent,
    KDSEventEnvelope
} from '../services/kdsEventDispatcher';
import { generateMockOrder } from '../utils/mockEventGenerator';
import { useKDSStore } from '../store/kdsStore';

interface KDSWebSocketContextType {
    /** True once the (simulated) WebSocket connection is established */
    isConnected: boolean;
    /** Send a raw message over the WebSocket transport */
    sendMessage: (msg: KDSEventEnvelope | Record<string, unknown>) => void;
}

const KDSWebSocketContext = createContext<KDSWebSocketContextType | undefined>(undefined);

export const useKDSWebSocket = () => {
    const context = useContext(KDSWebSocketContext);
    if (!context) {
        throw new Error('useKDSWebSocket must be used within a KDSWebSocketProvider');
    }
    return context;
};

export const KDSWebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { tenantId, storeIds } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const { addOrUpdateOrder } = useKDSStore();

    // ── 1. Bridge Dispatcher Events back to Store ───────────────────────────
    useEffect(() => {
        const unsubscribe = subscribeToEvents((envelope) => {
            // Only handle "received" events that imply a server-side or remote change
            // For now, any 'order.new' or generic order updates should hydrate the store
            if (envelope.type === 'order.new' || envelope.type === 'order.updated') {
                const order = envelope.payload as any;
                addOrUpdateOrder(order);
                console.info(`[KDS-WS-StoreBridge] ${envelope.type === 'order.new' ? 'Added' : 'Updated'} order #${order.orderNumber}`);
            } else if (envelope.type === 'order.cancelled') {
                const { orderId } = envelope.payload as { orderId: string };
                useKDSStore.getState().removeOrder(orderId);
                console.info(`[KDS-WS-StoreBridge] Removed cancelled order ${orderId}`);
            }
        });
        return unsubscribe;
    }, [addOrUpdateOrder]);

    // ── 2. Simulate WebSocket connection & Mock Activity ────────────────────
    useEffect(() => {
        // A. Simulate a brief connection handshake delay
        const connectionTimer = setTimeout(() => {
            setIsConnected(true);
            console.info('[KDSWebSocket] Simulated connection established.');
        }, 500);

        // B. Simulate incoming new orders from the "server" every 30 seconds
        const orderInterval = setInterval(() => {
            const newOrder = generateMockOrder();
            // We dispatch through the existing system so that listeners (StoreBridge) catch it
            emitEvent('order.new', newOrder as any, {
                idempotencyKey: `ws-new-${newOrder.id}`
            });
        }, 30000);

        return () => {
            clearTimeout(connectionTimer);
            clearInterval(orderInterval);
            setIsConnected(false);
        };
    }, []);

    // ── Configure dispatcher with live session context on mount ────────────────
    useEffect(() => {
        configureDispatcher({
            tenantId: tenantId ?? 'unknown',
            storeId: storeIds?.[0] ?? 'unknown'
        });

        // ── Register the WebSocket emitter (placeholder until real socket) ───────
        setWebSocketEmitter((envelope: KDSEventEnvelope) => {
            // Placeholder: log all outbound events in development
            if (process.env.NODE_ENV === 'development') {
                console.groupCollapsed(
                    `%c[WS→] ${envelope.type}`,
                    'color: #1FA4A9; font-weight: bold; font-size: 11px;'
                );
                console.table({
                    tenant_id: envelope.tenant_id,
                    store_id: envelope.store_id,
                    actor_user_id: envelope.actor_user_id,
                    actor_type: envelope.actor_type,
                    timestamp: envelope.timestamp,
                    idempotencyKey: envelope.idempotencyKey,
                });
                console.log('payload:', envelope.payload);
                console.groupEnd();
            }
        });

    }, [tenantId, storeIds]);

    // ── sendMessage helper ─────────────────────────────────────────────────────
    const sendMessage = useCallback((msg: KDSEventEnvelope | Record<string, unknown>) => {
        if (!isConnected) {
            console.warn('[KDSWebSocket] Cannot send — not connected.', msg);
            return;
        }
        // Placeholder for raw message sends outside of emitEvent flow
        console.log('[KDSWebSocket] sendMessage (placeholder):', msg);
    }, [isConnected]);

    // ── Context value ──────────────────────────────────────────────────────────
    const value: KDSWebSocketContextType = {
        isConnected,
        sendMessage
    };

    return (
        <KDSWebSocketContext.Provider value={value}>
            {children}
        </KDSWebSocketContext.Provider>
    );
};
