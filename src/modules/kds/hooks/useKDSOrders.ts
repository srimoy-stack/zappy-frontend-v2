import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useKDSStore } from '../store/kdsStore';
import { KDSOrder } from '../types/kds';
import { useKDSSound } from '../components/sound/useKDSSound';

/**
 * useKDSOrders Hook
 * Place holder for WebSocket event subscriptions.
 * In a real scenario, this would listen to 'order.created', 'order.updated', etc.
 */
export const useKDSOrders = () => {
    const { addOrUpdateOrder, removeOrder } = useKDSStore();

    const { playSound } = useKDSSound();

    useEffect(() => {
        // Mock socket event listener
        const handleNewOrder = (order: KDSOrder) => {
            // Idempotency guaranteed by backend UNIQUE constraint,
            // but double guard at UI level for safety.
            const externalOrderMap = useKDSStore.getState().externalOrderMap;
            if (order.external_order_id && externalOrderMap[order.external_order_id] && externalOrderMap[order.external_order_id] !== order.id) {
                return;
            }

            addOrUpdateOrder(order);
            playSound('NEW_ORDER', order.id);
        };

        const handleOrderUpdated = (order: KDSOrder) => {
            const externalOrderMap = useKDSStore.getState().externalOrderMap;
            if (order.external_order_id && externalOrderMap[order.external_order_id] && externalOrderMap[order.external_order_id] !== order.id) {
                return;
            }

            addOrUpdateOrder(order);
            playSound('ORDER_UPDATED', order.id);
        };

        const handleOrderCancelled = (orderId: string) => {
            removeOrder(orderId);
            playSound('ORDER_CANCELLED', orderId);
        };

        // For now, we don't have a real socket, but we establish the hook structure.
        console.log('KDS Orders Subscription Active', { handleNewOrder, handleOrderUpdated, handleOrderCancelled });

        return () => {
            console.log('KDS Orders Subscription Inactive');
        };
    }, [addOrUpdateOrder, removeOrder, playSound]);

    // Return the list of orders from the store
    const orders = useKDSStore(useShallow((state) => Object.values(state.orders)));

    return {
        orders,
    };
};
