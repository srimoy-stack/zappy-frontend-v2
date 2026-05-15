import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KDSOrder, KitchenStage, KDSStation, KDSOrderTicket } from '../types/kds';
import { calculateETA } from '../utils/etaUtils';
import { KDSRole, canDelayOrder, canCancelOrder, canOverrideStage } from '../utils/kdsAccess';
import { emitEvent } from '../services/kdsEventDispatcher';
import { logKDSAction } from '../services/kdsAuditLogger';

interface PendingAction {
    id: string;
    type: string;
    payload: any;
    timestamp: string;
}

export interface KDSState {
    orders: Record<string, KDSOrder>;
    externalOrderMap: Record<string, string>; // external_order_id -> order.id
    tickets: Record<string, KDSOrderTicket>; // Requirement 9.2: kds_order_tickets
    isOnline: boolean;
    isLoading: boolean;
    error: string | null;
    pendingActions: PendingAction[];

    // Station Routing Settings
    enable_station_routing: boolean;
    allow_item_station_override: boolean;
    kds_stations: KDSStation[];
    category_station_map: Record<string, string>; // category_id -> station_id
    item_station_map: Record<string, string>; // item_name -> station_id
    selectedStationId: string | 'ALL';
    master_screen_view_mode: 'FULL_ORDER' | 'STATION_ONLY';
    order_ready_rule: 'ALL_STATIONS_COMPLETE' | 'EXPO_CONFIRMS_READY';
    sound_scope: 'STATION_ONLY' | 'ALL_DEVICES';
    station_prep_time_override_enabled: boolean;
    station_delay_affects_global_eta: boolean;
    station_print_mode: 'PRINT_BY_STATION' | 'PRINT_FULL_ORDER';

    addOrUpdateOrder: (order: KDSOrder) => void;
    batchUpdateOrders: (orders: KDSOrder[]) => void;
    removeOrder: (orderId: string) => void;
    updateOrderStage: (orderId: string, stage: KitchenStage) => void;
    acceptOrder: (orderId: string) => void;
    advanceStage: (orderId: string) => void;
    markDelayed: (orderId: string, reason?: string) => void;
    delayOrder: (orderId: string, additionalMinutes: number, role: KDSRole, reason?: string) => void;
    cancelOrder: (orderId: string, role: KDSRole, reason?: string) => void;
    overrideStage: (orderId: string, stage: KitchenStage, role: KDSRole) => void;
    incrementPrepTime: (orderId: string, minutes?: number) => void;
    sendCustomerMessage: (orderId: string, channel: 'SMS' | 'EMAIL' | 'BOTH', message: string) => void;
    setOnlineStatus: (status: boolean) => void;
    toggleHold: (orderId: string) => void;
    queueAction: (type: string, payload: any) => void;
    replayQueuedActions: () => void;
    autoInitNetworkListener: () => void;

    setStationRouting: (enabled: boolean) => void;
    setAllowItemOverride: (enabled: boolean) => void;
    setStations: (stations: KDSStation[]) => void;
    updateCategoryStationMap: (map: Record<string, string>) => void;
    updateItemStationMap: (map: Record<string, string>) => void;
    setSelectedStation: (stationId: string | 'ALL') => void;
    setMasterViewMode: (mode: 'FULL_ORDER' | 'STATION_ONLY') => void;

    bootstrap: (stationId?: string) => Promise<void>;
    setOrderReadyRule: (rule: 'ALL_STATIONS_COMPLETE' | 'EXPO_CONFIRMS_READY') => void;
    setSoundScope: (scope: 'STATION_ONLY' | 'ALL_DEVICES') => void;
    setStationPrepTimeEnabled: (enabled: boolean) => void;
    setStationDelayAffectsGlobalEta: (affected: boolean) => void;
    setStationPrintMode: (mode: 'PRINT_BY_STATION' | 'PRINT_FULL_ORDER') => void;
    setRoutingRules: (rules: Partial<KDSState>) => void;
    setTickets: (tickets: KDSOrderTicket[]) => void;

    fulfilledOrders: KDSOrder[];

    historySettings: {
        limit: number;
        expiryMinutes: number;
    };
    lastRemovedOrder: KDSOrder | null;
    recallOrder: () => void;
    recallFulfilledOrder: (orderId: string) => void;
    cleanupFulfilledOrders: () => void;
    injectStressTestOrders: (count: number) => void;
    updateItemCompletion: (orderId: string, itemIds: string[], completed: boolean) => void;
}

export const useKDSStore = create<KDSState>()(
    persist(
        (set, get) => ({
            orders: {},
            externalOrderMap: {},
            tickets: {},
            isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
            isLoading: false,
            error: null,
            pendingActions: [],
            fulfilledOrders: [],
            historySettings: {
                limit: 20,
                expiryMinutes: 60,
            },
            lastRemovedOrder: null,

            // Default Routing Settings
            enable_station_routing: false,
            allow_item_station_override: true,
            selectedStationId: 'ALL',
            kds_stations: [
                {
                    station_id: 'kitchen',
                    station_name: 'Kitchen Main',
                    type: 'KITCHEN',
                    active: true,
                    display_order: 1,
                    default_view_mode: 'KANBAN',
                    routing_category_ids: ['burgers', 'tacos', 'sides'],
                    sound_config: { new_order: true, alert: true }
                },
                {
                    station_id: 'pizza',
                    station_name: 'Pizza Line',
                    type: 'KITCHEN',
                    active: true,
                    display_order: 2,
                    default_view_mode: 'KANBAN',
                    routing_category_ids: ['pizza'],
                    sound_config: { new_order: true, alert: true }
                },
                {
                    station_id: 'bar',
                    station_name: 'Bar / Drinks',
                    type: 'BAR',
                    active: true,
                    display_order: 3,
                    default_view_mode: 'GRID',
                    routing_category_ids: ['drinks'],
                    sound_config: { new_order: true, alert: true }
                },
                {
                    station_id: 'expo',
                    station_name: 'Expo Master',
                    type: 'EXPO',
                    active: true,
                    display_order: 4,
                    default_view_mode: 'SUMMARY',
                    routing_category_ids: [],
                    sound_config: { new_order: true, alert: true }
                },
            ],
            category_station_map: {
                'burgers': 'kitchen',
                'pizza': 'pizza',
                'tacos': 'kitchen',
                'drinks': 'bar',
                'sides': 'kitchen'
            },
            item_station_map: {
                'Beer': 'bar',
                'Coke': 'bar'
            },
            master_screen_view_mode: 'FULL_ORDER',
            order_ready_rule: 'ALL_STATIONS_COMPLETE',
            sound_scope: 'STATION_ONLY',
            station_prep_time_override_enabled: false,
            station_delay_affects_global_eta: true,
            station_print_mode: 'PRINT_BY_STATION',

            setStationRouting: (enabled) => set({ enable_station_routing: enabled }),
            setAllowItemOverride: (enabled) => set({ allow_item_station_override: enabled }),
            setStations: (stations) => set({ kds_stations: stations }),
            updateCategoryStationMap: (map) => set({ category_station_map: map }),
            updateItemStationMap: (map) => set({ item_station_map: map }),
            setSelectedStation: (stationId) => set({ selectedStationId: stationId }),
            setMasterViewMode: (mode) => set({ master_screen_view_mode: mode }),
            setOrderReadyRule: (rule) => set({ order_ready_rule: rule }),
            setSoundScope: (scope) => set({ sound_scope: scope }),
            setStationPrepTimeEnabled: (enabled) => set({ station_prep_time_override_enabled: enabled }),
            setStationDelayAffectsGlobalEta: (affected) => set({ station_delay_affects_global_eta: affected }),
            setStationPrintMode: (mode) => set({ station_print_mode: mode }),
            setRoutingRules: (rules) => set((state) => ({ ...state, ...rules })),

            bootstrap: async (stationId?: string) => {
                set({ isLoading: true, error: null });
                try {
                    // Requirement 10.1: Bootstrap / Config
                    // Dynamic import to break circular dependency with kdsBootstrapService
                    const { bootstrapKDS } = await import('../services/kdsBootstrapService');
                    await bootstrapKDS(stationId);
                    set({ isLoading: false });
                } catch (err: any) {
                    console.error('[KDSStore] Bootstrap failed:', err);
                    set({ isLoading: false, error: err.message || 'Failed to initialize KDS' });
                }
            },

            setTickets: (newTickets) => set((state) => {
                const tickets = { ...state.tickets };
                newTickets.forEach(ticket => {
                    tickets[ticket.id] = ticket;
                });
                return { tickets };
            }),


            updateItemCompletion: (orderId, itemIds, completed) => {
                set((state) => {
                    const order = state.orders[orderId];
                    if (!order) return state;

                    const now = new Date().toISOString();
                    const updatedItems = order.items.map((item) =>
                        itemIds.includes(item.id) ? { ...item, isCompleted: completed } : item
                    );

                    // Audit individual item completion
                    itemIds.forEach(id => {
                        const itm = order.items.find(i => i.id === id);
                        logKDSAction('order.item_completed', {
                            orderId,
                            orderNumber: order.orderNumber,
                            itemId: id,
                            itemName: itm?.name,
                            completed
                        });
                    });

                    const allCompleted = updatedItems.every(i => i.isCompleted);
                    const shouldBumpToReady = allCompleted && order.stage === 'PREPARING';

                    let nextStage = order.stage;
                    let stageHistory = order.stageHistory || [];

                    if (shouldBumpToReady) {
                        nextStage = 'READY';
                        stageHistory = [...stageHistory, { stage: 'READY', startedAt: now }];

                        emitEvent('order.bumped', {
                            orderId,
                            orderNumber: order.orderNumber,
                            source: 'ITEM_COMPLETION'
                        });

                        logKDSAction('order.stage_advanced', {
                            orderId,
                            orderNumber: order.orderNumber,
                            from_stage: order.stage,
                            to_stage: 'READY',
                            trigger: 'ALL_ITEMS_COMPLETED'
                        });
                    }

                    return {
                        orders: {
                            ...state.orders,
                            [orderId]: {
                                ...order,
                                items: updatedItems,
                                stage: nextStage,
                                stageHistory,
                                updatedAt: now
                            },
                        },
                    };
                });
            },

            addOrUpdateOrder: (order) =>
                set((state) => {
                    const internalId = order.id;
                    const idByExternal = order.external_order_id ? state.externalOrderMap[order.external_order_id] : null;
                    const targetId = idByExternal || internalId;
                    const existing = state.orders[targetId];

                    if (existing && new Date(order.updatedAt) <= new Date(existing.updatedAt)) {
                        return state;
                    }

                    const newExternalMap = { ...state.externalOrderMap };
                    if (order.external_order_id) {
                        newExternalMap[order.external_order_id] = targetId;
                    }

                    return {
                        orders: {
                            ...state.orders,
                            [targetId]: { ...order, id: targetId },
                        },
                        externalOrderMap: newExternalMap,
                    };
                }),

            batchUpdateOrders: (newOrders) =>
                set((state) => {
                    const updatedOrders = { ...state.orders };
                    const updatedExternalMap = { ...state.externalOrderMap };

                    newOrders.forEach(order => {
                        const extId = order.external_order_id;
                        const targetId = (extId ? updatedExternalMap[extId] : order.id) || order.id;
                        const existing = updatedOrders[targetId];

                        if (existing) {
                            if (new Date(order.updatedAt) <= new Date(existing.updatedAt)) return;

                            // Requirement 5.2: If edited, preserve stage
                            const mergedOrder: KDSOrder = {
                                ...order,
                                id: targetId,
                                stage: existing.stage, // Preserve
                                stageStartedAt: existing.stageStartedAt,
                                stageHistory: existing.stageHistory,
                            };
                            updatedOrders[targetId] = mergedOrder;
                            emitEvent('order.updated', { orderId: targetId, timestamp: new Date().toISOString() });
                        } else {
                            if (extId) updatedExternalMap[extId] = targetId;
                            updatedOrders[targetId] = { ...order, id: targetId };
                        }
                    });

                    return {
                        orders: updatedOrders,
                        externalOrderMap: updatedExternalMap,
                    };
                }),

            removeOrder: (orderId) =>
                set((state) => {
                    const order = state.orders[orderId];
                    if (!order) return state;

                    const newOrders = { ...state.orders };
                    const newExternalMap = { ...state.externalOrderMap };

                    if (order.external_order_id) {
                        delete newExternalMap[order.external_order_id];
                    }
                    delete newOrders[orderId];

                    return {
                        orders: newOrders,
                        externalOrderMap: newExternalMap,
                        lastRemovedOrder: order
                    };
                }),

            queueAction: (type, payload) => {
                set((state) => ({
                    pendingActions: [
                        ...state.pendingActions,
                        {
                            id: payload.idempotencyKey || crypto.randomUUID(),
                            type,
                            payload,
                            timestamp: new Date().toISOString()
                        }
                    ]
                }));
            },

            autoInitNetworkListener: () => {
                if (typeof window === 'undefined') return;
                const updateStatus = () => get().setOnlineStatus(navigator.onLine);
                window.addEventListener('online', updateStatus);
                window.addEventListener('offline', updateStatus);
                updateStatus();
            },

            updateOrderStage: (orderId, stage) => {
                const { isOnline, queueAction } = get();
                set((state: KDSState) => {
                    const order = state.orders[orderId];
                    if (!order) return state;

                    const now = new Date();
                    const idempotencyKey = `stage-update-${orderId}-${now.getTime()}`;

                    let updates: Partial<KDSOrder> = {
                        stage,
                        stageStartedAt: now.toISOString(),
                        isPendingSync: !isOnline,
                    };

                    if (stage === 'PREPARING') {
                        const prepTime = order.prepTimeMinutes || 10;
                        const createdAt = new Date(order.createdAt);
                        const estimatedTime = new Date(createdAt.getTime() + prepTime * 60000);
                        updates = {
                            ...updates,
                            prepTimeMinutes: prepTime,
                            estimatedReadyTime: estimatedTime.toISOString()
                        };
                    }

                    const eventPayload = {
                        orderId,
                        orderNumber: order.orderNumber,
                        newStage: stage,
                        timestamp: now.toISOString()
                    };

                    if (isOnline) {
                        emitEvent('order.stage_updated', eventPayload, { idempotencyKey });
                    } else {
                        queueAction('order.stage_updated', { ...eventPayload, idempotencyKey });
                    }

                    return {
                        orders: {
                            ...state.orders,
                            [orderId]: { ...order, ...updates },
                        },
                    };
                });
            },

            acceptOrder: (orderId: string) => {
                const { isOnline, queueAction } = get();
                set((state: KDSState) => {
                    const order = state.orders[orderId];
                    if (!order || order.stage !== 'NEW') return state;

                    const now = new Date();
                    const { station_prep_time_override_enabled, kds_stations, selectedStationId } = state;
                    let forcedPrepDuration = 10;

                    if (station_prep_time_override_enabled && selectedStationId !== 'ALL') {
                        const station = kds_stations.find(s => s.station_id === selectedStationId);
                        if (station?.default_prep_time) forcedPrepDuration = station.default_prep_time;
                    }

                    const elapsedMinutes = Math.floor((now.getTime() - new Date(order.createdAt).getTime()) / 60000);
                    const updatedPrepTimeMinutes = forcedPrepDuration + elapsedMinutes;
                    const etaFormatted = new Date(now.getTime() + forcedPrepDuration * 60000).toISOString();

                    const prevStageEntry = {
                        stage: order.stage,
                        startedAt: order.stageStartedAt || order.createdAt,
                        completedAt: now.toISOString(),
                    };

                    const stageHistory = [...(order.stageHistory || []), prevStageEntry];
                    const idempotencyKey = `accept-${orderId}`;

                    const eventPayload = {
                        orderId,
                        orderNumber: order.orderNumber,
                        trackingToken: order.trackingToken,
                        customerName: order.customerName,
                        prepTimeMinutes: forcedPrepDuration,
                        estimatedReadyTime: etaFormatted,
                        acceptedAt: now.toISOString()
                    };

                    if (isOnline) {
                        emitEvent('kitchen.prep_time_set', eventPayload, { idempotencyKey });
                        if (order.order_source === 'UBER_DIRECT') {
                            emitEvent('uber.order.accepted', {
                                external_order_id: order.external_order_id,
                                orderId: order.id,
                                prepTimeMinutes: forcedPrepDuration,
                                estimatedReadyTime: etaFormatted
                            }, { idempotencyKey: `uber-accept-${order.id}` });
                        }
                    } else {
                        queueAction('kitchen.prep_time_set', { ...eventPayload, idempotencyKey });
                    }

                    // ── Audit: Accept Order ─────────────────────────────────
                    logKDSAction('order.stage_advanced', {
                        orderId,
                        orderNumber: order.orderNumber,
                        from_stage: order.stage,
                        to_stage: 'ACCEPTED',
                        metadata: {
                            forcedPrepDuration,
                            etaFormatted
                        }
                    });

                    return {
                        orders: {
                            ...state.orders,
                            [orderId]: {
                                ...order,
                                stage: 'ACCEPTED',
                                stageStartedAt: now.toISOString(),
                                prepTimeMinutes: updatedPrepTimeMinutes,
                                estimatedReadyTime: etaFormatted,
                                stageHistory,
                                isPendingSync: !isOnline,
                            },
                        },
                    };
                });
            },

            advanceStage: (orderId: string) => {
                const { isOnline, queueAction } = get();
                const currentOrder = get().orders[orderId];
                if (!currentOrder) return;

                if (currentOrder.stage === 'READY') {
                    const now = new Date().toISOString();
                    const completedOrder = {
                        ...currentOrder,
                        stage: 'COMPLETED' as KitchenStage,
                        updatedAt: now,
                        isCompleting: true
                    };

                    set((state) => ({
                        orders: { ...state.orders, [orderId]: completedOrder }
                    }));

                    const idempotencyKey = `fulfill-${orderId}`;
                    emitEvent('order.fulfilled', {
                        orderId,
                        orderNumber: currentOrder.orderNumber,
                        timestamp: now
                    }, { idempotencyKey });

                    // ── Audit: Order Completion ────────────────────────────
                    logKDSAction('order.fulfilled', {
                        orderId,
                        orderNumber: currentOrder.orderNumber,
                        from_stage: 'READY',
                        to_stage: 'COMPLETED'
                    });

                    setTimeout(() => {
                        set((state) => {
                            const newOrders = { ...state.orders };
                            delete newOrders[orderId];
                            const { limit } = state.historySettings;
                            const newFulfilled = [completedOrder, ...state.fulfilledOrders.filter(o => o.id !== orderId)].slice(0, limit);
                            return {
                                orders: newOrders,
                                fulfilledOrders: newFulfilled,
                                lastRemovedOrder: completedOrder
                            };
                        });
                    }, 1000);
                    return;
                }

                set((state: KDSState) => {
                    const order = state.orders[orderId];
                    if (!order) return state;

                    const stages: KitchenStage[] = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
                    let nextIndex = stages.indexOf(order.stage) + 1;
                    if (order.stage === 'NEW' || order.stage === 'ACCEPTED') {
                        nextIndex = stages.indexOf('PREPARING');
                    }
                    // Recalled orders go back into the cooking queue
                    if (order.stage === 'RECALLED') {
                        nextIndex = stages.indexOf('PREPARING');
                    }
                    const nextStage = stages[nextIndex];
                    if (!nextStage) return state;

                    const now = new Date().toISOString();
                    const prevStageEntry = {
                        stage: order.stage,
                        startedAt: order.stageStartedAt || order.createdAt,
                        completedAt: now,
                    };

                    const stageHistory = [...(order.stageHistory || []), prevStageEntry];
                    const idempotencyKey = `advance-${orderId}-${new Date(now).getTime()}`;

                    const eventPayload = {
                        orderId,
                        orderNumber: order.orderNumber,
                        previousStage: order.stage,
                        newStage: nextStage,
                        timestamp: now
                    };

                    if (isOnline) {
                        emitEvent('order.stage_advanced', eventPayload, { idempotencyKey });
                    } else {
                        queueAction('order.stage_advanced', { ...eventPayload, idempotencyKey });
                    }

                    // ── Audit: Stage Advance ────────────────────────────────
                    logKDSAction('order.stage_advanced', {
                        orderId,
                        orderNumber: order.orderNumber,
                        from_stage: order.stage,
                        to_stage: nextStage
                    });

                    return {
                        orders: {
                            ...state.orders,
                            [orderId]: {
                                ...order,
                                stage: nextStage,
                                stageStartedAt: now,
                                stageHistory,
                                isPendingSync: !isOnline,
                            },
                        },
                    };
                });
            },

            markDelayed: (orderId, reason) =>
                set((state) => {
                    const order = state.orders[orderId];
                    if (!order) return state;
                    return {
                        orders: {
                            ...state.orders,
                            [orderId]: { ...order, isDelayed: true, delayReason: reason },
                        },
                    };
                }),

            delayOrder: (orderId, additionalMinutes, role, reason) => {
                if (role && !canDelayOrder(role)) return;
                const { isOnline, queueAction } = get();
                set((state) => {
                    const order = state.orders[orderId];
                    if (!order) return state;

                    const now = new Date().toISOString();
                    const willUpdateGlobal = state.station_delay_affects_global_eta;
                    const newTotalPrepTime = (order.prepTimeMinutes || 0) + (willUpdateGlobal ? additionalMinutes : 0);
                    const newETA = willUpdateGlobal ? calculateETA(order.createdAt, newTotalPrepTime) : order.estimatedReadyTime;
                    const idempotencyKey = `delay-${orderId}-${new Date(now).getTime()}`;

                    const delayEntry = { minutes: additionalMinutes, reason, timestamp: now };
                    const eventPayload = {
                        orderId,
                        orderNumber: order.orderNumber,
                        trackingToken: order.trackingToken,
                        customerName: order.customerName,
                        additionalMinutes,
                        newEstimatedReadyTime: newETA,
                        reason: reason || 'KITCHEN_DELAY',
                        updatedAt: now,
                        isGlobalUpdate: willUpdateGlobal
                    };

                    if (isOnline) {
                        emitEvent('order.delayed', eventPayload, { idempotencyKey });
                        if (order.order_source === 'UBER_DIRECT') {
                            emitEvent('uber.order.eta_updated', {
                                external_order_id: order.external_order_id,
                                orderId: order.id,
                                additionalMinutes,
                                newEstimatedReadyTime: newETA
                            }, { idempotencyKey: `uber-sync-${idempotencyKey}` });
                        }
                    } else {
                        queueAction('order.delayed', { ...eventPayload, idempotencyKey });
                    }

                    // ── Audit: Delay Order ──────────────────────────────────
                    logKDSAction('order.delayed', {
                        orderId,
                        orderNumber: order.orderNumber,
                        additionalMinutes,
                        reason: reason || 'KITCHEN_DELAY',
                        from_stage: order.stage,
                        to_stage: order.stage,
                        role
                    });

                    return {
                        orders: {
                            ...state.orders,
                            [orderId]: {
                                ...order,
                                prepTimeMinutes: newTotalPrepTime,
                                estimatedReadyTime: newETA,
                                isDelayed: true,
                                delayReason: reason || order.delayReason,
                                delayLog: [...(order.delayLog || []), delayEntry],
                                isPendingSync: !isOnline,
                            },
                        },
                    };
                });
            },

            cancelOrder: (orderId, role, reason) => {
                if (role && !canCancelOrder(role)) return;
                const { isOnline, queueAction } = get();
                set((state) => {
                    const order = state.orders[orderId];
                    if (!order) return state;

                    const now = new Date().toISOString();
                    const idempotencyKey = `cancel-${orderId}`;
                    const eventPayload = { orderId, role, reason, timestamp: now };

                    if (isOnline) {
                        emitEvent('order.cancelled', eventPayload, { idempotencyKey });
                    } else {
                        queueAction('order.cancelled', { ...eventPayload, idempotencyKey });
                    }

                    // ── Audit: Cancel Order ─────────────────────────────────
                    logKDSAction('order.cancelled', {
                        orderId,
                        orderNumber: order.orderNumber,
                        from_stage: order.stage,
                        to_stage: 'CANCELLED',
                        reason: reason || 'KDS_VOID',
                        role
                    });

                    const logEntry = {
                        action: 'CANCELLED' as const,
                        note: reason || 'KDS Void',
                        timestamp: now,
                        user: role
                    };

                    const newOrders = { ...state.orders };
                    const newExternalMap = { ...state.externalOrderMap };
                    if (order.external_order_id) delete newExternalMap[order.external_order_id];
                    delete newOrders[orderId];

                    // Note: In a real system we might keep the order in a "CANCELLED" bucket
                    // For now we follow the existing pattern of removing it from active state
                    return {
                        orders: newOrders,
                        externalOrderMap: newExternalMap,
                        lastRemovedOrder: { ...order, stage: 'CANCELLED', auditLog: [...(order.auditLog || []), logEntry] }
                    };
                });
            },

            overrideStage: (orderId, stage, role) => {
                if (role && !canOverrideStage(role)) return;
                const order = get().orders[orderId];
                // ── Audit: Override Stage ─────────────────────────────────
                logKDSAction('order.stage_override', {
                    orderId,
                    orderNumber: order?.orderNumber,
                    from_stage: order?.stage,
                    to_stage: stage,
                    role
                });
                get().updateOrderStage(orderId, stage);
            },

            incrementPrepTime: (orderId, minutes = 5) => {
                const { isOnline, queueAction } = get();
                set((state) => {
                    const order = state.orders[orderId];
                    if (!order || order.stage === 'READY') return state;

                    const incrementedPrepTime = (order.prepTimeMinutes || 0) + minutes;
                    const newETA = calculateETA(order.createdAt, incrementedPrepTime);
                    const now = new Date().toISOString();
                    const idempotencyKey = `increment-${orderId}-${Date.now()}`;

                    const eventPayload = {
                        orderId,
                        orderNumber: order.orderNumber,
                        trackingToken: order.trackingToken,
                        customerName: order.customerName,
                        additionalMinutes: minutes,
                        totalPrepMinutes: incrementedPrepTime,
                        newEstimatedReadyTime: newETA,
                        updatedAt: now
                    };

                    if (isOnline) {
                        emitEvent('kitchen.prep_time_updated', eventPayload, { idempotencyKey });
                    } else {
                        queueAction('kitchen.prep_time_updated', { ...eventPayload, idempotencyKey });
                    }

                    // ── Audit: Increment Prep Time ─────────────────────────
                    logKDSAction('order.prep_time_incremented', {
                        orderId,
                        orderNumber: order.orderNumber,
                        additionalMinutes: minutes,
                        newTotalMinutes: incrementedPrepTime,
                        from_stage: order.stage,
                        to_stage: order.stage
                    });

                    return {
                        orders: {
                            ...state.orders,
                            [orderId]: {
                                ...order,
                                prepTimeMinutes: incrementedPrepTime,
                                estimatedReadyTime: newETA,
                                isPendingSync: !isOnline,
                            },
                        },
                    };
                });
            },

            sendCustomerMessage: (orderId, channel, message) => {
                set((state) => {
                    const order = state.orders[orderId];
                    if (!order) return state;

                    const now = new Date().toISOString();
                    const logEntry = { channel, message, sentAt: now, sentBy: 'KDS_SYSTEM' };
                    const idempotencyKey = `notification-${orderId}-${now}`;

                    emitEvent('order.customer_notification', { orderId, channel, message, sentAt: now }, { idempotencyKey });

                    // ── Audit: Customer Message ─────────────────────────────
                    logKDSAction('order.customer_notification', {
                        orderId,
                        orderNumber: order.orderNumber,
                        channel,
                        messagePreview: message.slice(0, 30) + '...',
                        from_stage: order.stage,
                        to_stage: order.stage
                    });

                    return {
                        orders: {
                            ...state.orders,
                            [orderId]: {
                                ...order,
                                notificationsLog: [...(order.notificationsLog || []), logEntry],
                            },
                        },
                    };
                });
            },

            setOnlineStatus: (status) => {
                const wasOffline = !get().isOnline;
                set({ isOnline: status });
                if (status && wasOffline) get().replayQueuedActions();
            },

            toggleHold: (orderId) => {
                const { isOnline, queueAction } = get();
                set((state) => {
                    const order = state.orders[orderId];
                    if (!order) return state;

                    const newHeldState = !order.isHeld;
                    const idempotencyKey = `hold-${orderId}-${Date.now()}`;

                    if (isOnline) {
                        emitEvent(newHeldState ? 'order.held' : 'order.resumed', { orderId }, { idempotencyKey });
                    } else {
                        queueAction(newHeldState ? 'order.held' : 'order.resumed', { orderId, idempotencyKey });
                    }

                    // ── Audit: Toggle Hold ──────────────────────────────────
                    logKDSAction(newHeldState ? 'order.held' : 'order.resumed', {
                        orderId,
                        orderNumber: order.orderNumber,
                        from_stage: order.stage,
                        to_stage: order.stage,
                        isHeld: newHeldState
                    });

                    return {
                        orders: {
                            ...state.orders,
                            [orderId]: { ...order, isHeld: newHeldState, isPendingSync: !isOnline }
                        }
                    };
                });
            },

            replayQueuedActions: () => {
                const { pendingActions } = get();
                if (pendingActions.length === 0) return;

                pendingActions.forEach(action => {
                    const { idempotencyKey, ...payload } = action.payload;
                    emitEvent(action.type, {
                        ...payload,
                        isReplayed: true,
                        originalTimestamp: action.timestamp
                    }, { idempotencyKey });
                });

                set({ pendingActions: [] });
                set((state) => {
                    const updatedOrders = { ...state.orders };
                    Object.keys(updatedOrders).forEach(id => {
                        if (updatedOrders[id]) updatedOrders[id] = { ...updatedOrders[id]!, isPendingSync: false };
                    });
                    return { orders: updatedOrders };
                });
            },

            recallOrder: () => {
                const { lastRemovedOrder } = get();
                if (lastRemovedOrder) get().recallFulfilledOrder(lastRemovedOrder.id);
            },

            recallFulfilledOrder: (orderId) => {
                set((state) => {
                    const orderFromFulfilled = state.fulfilledOrders.find(o => o.id === orderId);
                    const orderFromRemoved = state.lastRemovedOrder?.id === orderId ? state.lastRemovedOrder : null;
                    const orderToRecall = orderFromFulfilled || orderFromRemoved;

                    if (!orderToRecall) return state;

                    const now = new Date().toISOString();
                    const recalledOrder = {
                        ...orderToRecall,
                        stage: 'RECALLED' as KitchenStage,
                        updatedAt: now,
                        isCompleting: false,
                        isPendingSync: !state.isOnline
                    };

                    emitEvent('order.reopened', {
                        orderId: recalledOrder.id,
                        orderNumber: recalledOrder.orderNumber,
                        timestamp: now
                    }, { idempotencyKey: `recall-${orderId}-${Date.now()}` });

                    // ── Audit: Order Reopened ───────────────────────────────
                    logKDSAction('order.reopened', {
                        orderId: recalledOrder.id,
                        orderNumber: recalledOrder.orderNumber,
                        from_stage: orderToRecall.stage,
                        to_stage: 'RECALLED'
                    });

                    return {
                        orders: {
                            ...state.orders,
                            [orderId]: recalledOrder
                        },
                        fulfilledOrders: state.fulfilledOrders.filter(o => o.id !== orderId),
                        lastRemovedOrder: state.lastRemovedOrder?.id === orderId ? null : state.lastRemovedOrder
                    };
                });
            },

            cleanupFulfilledOrders: () => {
                set((state) => {
                    const { expiryMinutes } = state.historySettings;
                    const cutoff = new Date(Date.now() - expiryMinutes * 60000);
                    const freshFulfilled = state.fulfilledOrders.filter(order => new Date(order.updatedAt) > cutoff);
                    if (freshFulfilled.length === state.fulfilledOrders.length) return state;
                    return { fulfilledOrders: freshFulfilled };
                });
            },

            injectStressTestOrders: (count) => {
                const generated: KDSOrder[] = [];
                const now = new Date();
                for (let i = 0; i < count; i++) {
                    generated.push({
                        id: `stress-${i}`,
                        orderNumber: `${10000 + i}`,
                        order_source: i % 2 === 0 ? 'ONLINE' : 'POS',
                        fulfillment_type: i % 3 === 0 ? 'STORE_DELIVERY' : 'PICKUP',
                        createdAt: new Date(now.getTime() - Math.random() * 1000000).toISOString(),
                        updatedAt: now.toISOString(),
                        stage: (i % 4 === 0 ? 'NEW' : 'PREPARING') as KitchenStage,
                        prepTimeMinutes: 10 + (i % 20),
                        estimatedReadyTime: new Date(now.getTime() + (10 + (i % 20)) * 60000).toISOString(),
                        trackingToken: `stress-${i}`,
                        customerName: i % 2 === 0 ? 'John Doe' : 'Jane Smith',
                        isDelayed: i % 10 === 0,
                        items: [
                            {
                                id: `item-${i}-1`,
                                name: i % 3 === 0 ? 'Classic Cheeseburger' : i % 3 === 1 ? 'Spicy Chicken Sandwich' : 'Vegan Garden Salad',
                                quantity: 1 + (i % 3),
                                modifiers: [],
                                categoryId: 'cat-1'
                            }
                        ]
                    });
                }
                get().batchUpdateOrders(generated);
            },
        }),
        {
            name: 'zyappy-kds-device-settings',
            version: 1,
            migrate: (persistedState: any, version: number) => {
                if (version === 0) {
                    // Update legacy stations to have the new routing_category_ids field if missing
                    const stations = persistedState.kds_stations || [];
                    persistedState.kds_stations = stations.map((s: any) => ({
                        ...s,
                        routing_category_ids: s.routing_category_ids || [],
                        sound_config: s.sound_config || { new_order: true, alert: true },
                        type: s.type || (s.station_id === 'expo' ? 'EXPO' : 'KITCHEN')
                    }));
                }
                return persistedState;
            },
            partialize: (state) => ({
                enable_station_routing: state.enable_station_routing,
                allow_item_station_override: state.allow_item_station_override,
                kds_stations: state.kds_stations,
                item_station_map: state.item_station_map,
                selectedStationId: state.selectedStationId,
                master_screen_view_mode: state.master_screen_view_mode,
                order_ready_rule: state.order_ready_rule,
                sound_scope: state.sound_scope,
                station_prep_time_override_enabled: state.station_prep_time_override_enabled,
                station_delay_affects_global_eta: state.station_delay_affects_global_eta,
                station_print_mode: state.station_print_mode,
            }),
        }
    )
);
