export type PaymentMethod = 'Card' | 'Cash' | 'Wallet' | 'Online';
export type PaymentStatus = 'Paid' | 'Failed' | 'Pending';

export interface PaymentRecord {
    id: string;
    date: string;
    orderId: string;
    orderNumber: string;
    method: PaymentMethod;
    status: PaymentStatus;
    grossAmount: number;
    fee: number;
    netAmount: number;
    store: string;
}

export type RefundType = 'Full' | 'Partial';
export type RefundReason = 'Customer request' | 'Order issue' | 'Payment error' | 'Other';

export interface RefundRecord {
    id: string;
    date: string;
    orderId: string;
    orderNumber: string;
    type: RefundType;
    amount: number; // Stored as positive, but will be displayed as negative
    reason: RefundReason;
    approvedBy: string;
    store: string;
}

export type PayoutStatus = 'Pending' | 'Paid' | 'Failed';

export interface PayoutRecord {
    id: string;
    period: string; // e.g. "Jan 1 – Jan 7"
    gross: number;
    fees: number;
    refunds: number;
    netPaidOut: number;
    status: PayoutStatus;
}
