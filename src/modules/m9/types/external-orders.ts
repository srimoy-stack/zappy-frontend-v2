export type ExternalOrderStatus = 'RECEIVED' | 'NORMALIZED' | 'REJECTED' | 'CANCELLED';
export type ExternalOrderProvider = 'UBER_EATS' | 'DOORDASH';

export type RejectCode =
    | 'ITEM_NOT_MAPPED'
    | 'MISSING_MODIFIER'
    | 'PRICE_MISMATCH'
    | 'INVALID_PAYLOAD'
    | 'STORE_CLOSED'
    | 'DUPLICATE_ORDER'
    | 'TIMEOUT'
    | null;

export interface NormalizationAttempt {
    attemptedAt: string;
    success: boolean;
    resolvedItems: number;
    unresolvedItems: string[]; // item names that failed to normalize
    error?: string;
}

export interface ExternalOrder {
    id: string;
    externalOrderId: string;
    provider: ExternalOrderProvider;
    status: ExternalOrderStatus;
    rejectCode: RejectCode;
    rejectMessage: string | null;
    receivedAt: string;
    rawPayload: Record<string, unknown>; // readonly, never editable
    normalizationAttempt: NormalizationAttempt | null;
    isArchived: boolean;
    storeId: string;
    storeName: string;
    customerName?: string;
    totalAmount?: number;
}
