'use client';

import { useEffect, useState } from 'react';
import { useKDSStore } from '../store/kdsStore';
import { KDSOrder } from '../types/kds';
import { useShallow } from 'zustand/react/shallow';

/**
 * useTrackingOrder Hook
 * Specialized for customer tracking page.
 * Listens for updates to a specific order identified by token.
 */
export const useTrackingOrder = (token: string) => {
    const orders = useKDSStore(useShallow((state) => state.orders));
    const [order, setOrder] = useState<KDSOrder | undefined>(
        Object.values(orders).find(o => o.trackingToken === token)
    );

    useEffect(() => {
        // Find the order in the current local store
        const foundOrder = Object.values(orders).find(o => o.trackingToken === token);
        setOrder(foundOrder);
    }, [orders, token]);

    useEffect(() => {
        // TODO: subscribe to tracking socket channel
        // In a real scenario, this would listen to something like `order.track.${token}`
        console.log(`Tracking Active for Token: ${token}`);

        return () => {
            console.log(`Tracking Inactive for Token: ${token}`);
        };
    }, [token]);

    return {
        order,
    };
};
