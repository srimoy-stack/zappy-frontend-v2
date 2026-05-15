'use client';

import { useEffect, useRef } from 'react';
import { useKDSStore } from '../../store/kdsStore';
import { useSoundStore } from '../../store/useSoundStore';
import { getSLAState } from '../../utils/slaUtils';

export const SoundManager: React.FC = () => {
    const orders = useKDSStore((state) => state.orders);
    const { settings, playedEvents, markEventPlayed } = useSoundStore();
    const prevOrdersRef = useRef<string[]>([]);

    const playSound = (type: 'newOrder' | 'delayed' | 'overdue') => {
        if (!settings[type]) return;

        try {
            const paths = {
                newOrder: '/sounds/confirm.mp3',
                delayed: '/sounds/alert.mp3',
                overdue: '/sounds/alert-overdue.mp3',
            };

            const audio = new Audio(paths[type]);
            audio.volume = settings.volume;
            audio.loop = false;
            audio.play().catch(() => { });
        } catch (e) {
            console.error('Audio playback failed', e);
        }
    };

    useEffect(() => {
        const orderIds = Object.keys(orders);
        const {
            enable_station_routing,
            selectedStationId,
            sound_scope,
            category_station_map,
            item_station_map,
            allow_item_station_override
        } = useKDSStore.getState();

        const isRelevant = (order: any) => {
            if (!enable_station_routing || selectedStationId === 'ALL' || sound_scope === 'ALL_DEVICES') return true;
            return order.items.some((item: any) => {
                const catStation = (item.categoryId && category_station_map[item.categoryId]) || 'kitchen';
                const itemStationId = (allow_item_station_override && item_station_map[item.name]) || catStation;
                return itemStationId === selectedStationId;
            });
        };

        // Check for NEW orders
        const newOrderIds = orderIds.filter(id => !prevOrdersRef.current.includes(id));
        newOrderIds.forEach(id => {
            const order = orders[id];
            if (order && isRelevant(order)) {
                playSound('newOrder');
            }
        });

        // Check for NEWLY delayed orders
        orderIds.forEach(id => {
            const order = orders[id];
            if (!order) return;

            const eventKey = `delayed-${id}`;
            if (order.isDelayed && !playedEvents.has(eventKey) && isRelevant(order)) {
                playSound('delayed');
                markEventPlayed(eventKey);
            }
        });

        prevOrdersRef.current = orderIds;
    }, [orders, settings, playedEvents, markEventPlayed]);

    // Periodic check for SLA breaches
    useEffect(() => {
        const interval = setInterval(() => {
            const state = useKDSStore.getState();
            const {
                enable_station_routing,
                selectedStationId,
                sound_scope,
                category_station_map,
                item_station_map,
                allow_item_station_override
            } = state;

            const isRelevant = (order: any) => {
                if (!enable_station_routing || selectedStationId === 'ALL' || sound_scope === 'ALL_DEVICES') return true;
                return order.items.some((item: any) => {
                    const catStation = (item.categoryId && category_station_map[item.categoryId]) || 'kitchen';
                    const itemStationId = (allow_item_station_override && item_station_map[item.name]) || catStation;
                    return itemStationId === selectedStationId;
                });
            };

            const allOrders = Object.values(state.orders);
            allOrders.forEach(order => {
                if (!order) return;
                const eventKey = `overdue-${order.id}`;
                if (getSLAState(order.createdAt, order.prepTimeMinutes) === 'OVERDUE' && !playedEvents.has(eventKey) && isRelevant(order)) {
                    playSound('overdue');
                    markEventPlayed(eventKey);
                }
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [settings, playedEvents, markEventPlayed]);

    return null;
};
