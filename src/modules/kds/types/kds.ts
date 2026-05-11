export type OrderSource =
    | 'POS'
    | 'CALL_CENTER'
    | 'ONLINE'
    | 'UBER_DIRECT'
    | 'KIOSK'
    | 'API';

export type FulfillmentType =
    | 'PICKUP'
    | 'STORE_DELIVERY'
    | 'UBER_DIRECT_DELIVERY'
    | 'DINE_IN';

export type SLAState =
    | 'ON_TIME'
    | 'WARNING'
    | 'OVERDUE';

export interface KDSModifier {
    name: string;
    groupType: 'PLACEMENT_TOPPING' | 'CHOICE_ONE' | 'QUANTITY_ONLY';
    placement?: 'FULL' | 'LEFT' | 'RIGHT' | 'QUARTER' | 'MIDDLE' | 'CENTER';
    quantity?: number;
}

export interface KDSItem {
    id: string; // Unique ID for partial completion tracking
    name: string;
    variant?: string;
    quantity?: number;
    categoryId?: string; // Added for category-based routing
    modifiers: KDSModifier[];
    isCompleted?: boolean;
}

export type StationType = 'MASTER' | 'KITCHEN' | 'BAR' | 'EXPO' | 'OTHER';

export interface KDSStation {
    station_id: string; // uuid
    brand_id?: string;
    store_id?: string;
    station_name: string;
    type: StationType;
    routing_category_ids: string[];
    sound_config: Record<string, any>; // JSON
    active: boolean;
    display_order: number;
    default_prep_time?: number;
    default_view_mode?: 'KANBAN' | 'GRID' | 'COMPACT' | 'SUMMARY';
    paired_device_hash?: string;
    station_token_hash?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * kds_station_category_map
 */
export interface KDSStationCategoryMap {
    id: string;
    station_id: string;
    category_id: string;
}

/** 
 * kds_order_tickets
 * Represents a station’s view of an order (or order segment)
 */
export interface KDSOrderTicket {
    id: string;
    order_id: string;
    store_id: string;
    station_id: string;
    stage: KitchenStage;
    items: string[] | KDSItem[]; // array of order_item_ids OR derived snapshot
    last_event_at: string;
    created_at: string;
    updated_at: string;
}

/**
 * kds_audit_log
 */
export interface KDSAuditLog {
    id: string;
    store_id: string;
    station_id?: string | null;
    order_id: string;
    order_item_id?: string | null;
    action: string; // e.g., ACCEPT, STAGE_MOVE, DELAY, CANCEL
    from_stage?: KitchenStage | null;
    to_stage?: KitchenStage | null;
    metadata: Record<string, any>; // reason, delay_minutes, message_id, etc.
    actor_user_id?: string | null;
    actor_type: 'USER' | 'STATION';
    created_at: string;
}

export type KitchenStage =
    | 'NEW'
    | 'ACCEPTED'
    | 'PREPARING'
    | 'READY'
    | 'COMPLETED'
    | 'RECALLED'
    | 'CANCELLED';

export interface KDSOrder {
    id: string;
    orderNumber: string;
    storeName?: string;

    order_source: OrderSource; // REQUIRED per spec
    fulfillment_type: FulfillmentType; // MUST NOT merge with source

    createdAt: string;
    updatedAt: string;
    external_order_id?: string;

    stage: KitchenStage;
    stageStartedAt?: string;

    stageHistory?: {
        stage: KitchenStage;
        startedAt: string;
        completedAt?: string;
    }[];

    prepTimeMinutes: number;
    estimatedReadyTime: string;

    isDelayed: boolean;
    delayReason?: string;
    delayLog?: {
        minutes: number;
        reason?: string;
        timestamp: string;
    }[];

    trackingToken: string;

    externalTotal?: number;
    zyappyCalculatedTotal?: number;

    items: KDSItem[];

    // Customer Contact (Optional/Fallback)
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;

    notificationsLog?: {
        channel: 'SMS' | 'EMAIL' | 'BOTH';
        message: string;
        sentAt: string;
        sentBy: string;
    }[];

    auditLog?: {
        action: 'CREATED' | 'ACCEPTED' | 'DELAYED' | 'CANCELLED' | 'STAGE_OVERRIDE' | 'COMPLETED' | 'RECALLED';
        note?: string;
        timestamp: string;
        user: string;
    }[];

    isPriority?: boolean;
    isHeld?: boolean;
    isPendingSync?: boolean;
    isCompleting?: boolean;
    notes?: string;
    allergies?: string[];
}

/** 
 * Requirement 15: Kitchen Stages Entity 
 * Used for dynamic sequence configuration per store.
 */
export interface KitchenStageConfig {
    id: string;
    store_id: string;
    name: string;
    sequence_order: number;
    active: boolean;
}

/** 
 * Requirement 15: Order Tracking Entity
 * External or flattened tracking state for customer-facing applications.
 */
export interface OrderTracking {
    order_id: string;
    tracking_token: string;
    prep_time_minutes: number;
    estimated_ready_time: string;
    is_delayed: boolean;
    delay_reason?: string;
}

/** 
 * Requirement 15: Customer Notifications Entity
 * Audit trail for outgoing communications.
 */
export interface CustomerNotification {
    id: string;
    order_id: string;
    channel: 'SMS' | 'EMAIL' | 'BOTH';
    message_body: string;
    sent_at: string;
    sent_by_user_id: string;
}
/**
 * Requirement 10.1: Bootstrap / Config Response
 */
export interface KDSBootstrapResponse {
    station: KDSStation;
    routing_rules: {
        enable_station_routing: boolean;
        item_station_map: Record<string, string>;
        allow_item_station_override: boolean;
    };
    category_station_map?: Record<string, string>; // Legacy support or derived from kds_station_category_map
    sound_config: Record<string, any>;
    open_tickets: KDSOrderTicket[];
    orders?: KDSOrder[]; // Full order details (optional if tickets have snapshots)
    user_claims?: Record<string, any>; // user claims / session info
}
