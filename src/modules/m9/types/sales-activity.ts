export type TransactionEventType = 'ORDER_PAID' | 'REFUND' | 'PARTIAL_REFUND';
export type SalesChannel = 'POS' | 'ONLINE' | 'UBER' | 'PHONE';
export type PaymentStatus = 'Paid' | 'Partial' | 'Due' | 'Refunded';

export interface TransactionEvent {
    id: string;
    timestamp: string; // ISO format
    type: TransactionEventType;
    invoiceNo: string;
    customerName: string;
    contactNumber: string;
    channel: SalesChannel;
    location: string; // Full location/address string
    storeId: string;
    userName: string;
    userId: string;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    totalAmount: number;
    basePrice: number;
    tax: number;
    netPrice: number;
    sellPrice: number;
    returnAmount: number;
    shipping: number;
    netDue: number;
    totalItems: number;
    currency: string;
    originalTransactionId?: string;
    status: 'completed' | 'failed' | 'processing';
}

export interface ActivityFilters {
    location?: string[];
    customer?: string;
    paymentStatus?: PaymentStatus[];
    dateRange?: string; // e.g. "01/01/2023 - 31/12/2023"
    user?: string[];
    shippingStatus?: string[];
    paymentMethod?: string[];
    refundsOnly: boolean;
    startDate: string | null;
    endDate: string | null;
    searchQuery?: string;
    channel?: SalesChannel[];
}
