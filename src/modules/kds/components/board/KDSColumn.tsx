'use client';

import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useKDSStore, KDSState } from '../../store/kdsStore';
import { OrderTicket } from '../ticket/OrderTicket';
import { useFilterStore } from '../../store/useFilterStore';
import { KitchenStage } from '../../types/kds';
import { getSLAState } from '../../utils/slaUtils';

import { isOrderVisibleOnStation } from '../../utils/routingUtils';

interface KDSColumnProps {
    title: string;
    stage: KitchenStage;
    onViewDetail: (orderId: string) => void;
}

export const KDSColumn: React.FC<KDSColumnProps> = React.memo(({ title, stage, onViewDetail }) => {
    const { fulfillment, source } = useFilterStore();
    const {
        enable_station_routing,
        selectedStationId,
        kds_stations,
        allow_item_station_override,
        item_station_map,
        master_screen_view_mode
    } = useKDSStore();

    // Each column subscribes ONLY to filtered orders that match its stage and station.
    const stageOrders = useKDSStore(
        useShallow((state: KDSState) =>
            Object.values(state.orders).filter(o => {
                const stageMatch = o.stage === stage;
                if (!stageMatch) return false;

                const fulfillmentMatch = fulfillment === 'ALL' || o.fulfillment_type === fulfillment;
                if (!fulfillmentMatch) return false;

                const sourceMatch = source === 'ALL' || o.order_source === source;
                if (!sourceMatch) return false;

                // Station Filtering Logic 
                return isOrderVisibleOnStation(o, {
                    enable_station_routing,
                    selectedStationId,
                    kds_stations,
                    allow_item_station_override,
                    item_station_map,
                    master_screen_view_mode
                });
            }).sort((a, b) => {
                // Sorting logic prioritized for performance (fail-fast)
                if (a.isPriority && !b.isPriority) return -1;
                if (!a.isPriority && b.isPriority) return 1;

                const aState = getSLAState(a.createdAt, a.prepTimeMinutes);
                const bState = getSLAState(b.createdAt, b.prepTimeMinutes);
                const statePriority: Record<string, number> = { 'OVERDUE': 0, 'WARNING': 1, 'ON_TIME': 2 };
                if (statePriority[aState] !== statePriority[bState]) {
                    return (statePriority[aState] ?? 2) - (statePriority[bState] ?? 2);
                }

                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            })
        )
    );

    return (
        <div className="kds-column" id={`stage-anchor-${stage}`}>
            <div className="kds-column-header">
                <span className="text-blue-400 font-black mb-4 flex items-center justify-center w-8 h-8 rounded-full bg-blue-400/10 text-xs border border-blue-400/20">
                    {stageOrders.length}
                </span>
                <h3 className="kds-column-title">{title}</h3>
            </div>
            <div className="kds-column-scroll scrollbar-hide">
                {stageOrders.length > 0 ? (
                    stageOrders.map(order => (
                        <div key={order.id} className="kds-ticket">
                            <OrderTicket orderId={order.id} onViewDetail={onViewDetail} />
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex items-center justify-center opacity-20">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Empty</span>
                    </div>
                )}
            </div>
        </div>
    );
});
