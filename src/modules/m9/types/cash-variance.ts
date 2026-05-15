export interface CashVarianceRecord {
    id: string;
    date: string;
    userName: string;
    userId: string;
    storeName: string;
    storeId: string;
    openingCash: number;
    closingCash: number;
    expectedCash: number;
    variance: number;
    status: 'Balanced' | 'Over' | 'Short';
    currency: string;
    shiftId: string;
    timestamp: string;
    paymentBreakdown?: {
        cash: number;
        card: number;
        other: number;
    };
}

export interface CashVarianceFilters {
    startDate: string | null;
    endDate: string | null;
    storeId?: string;
    userId?: string;
    status?: 'Balanced' | 'Over' | 'Short';
    varianceOnly: boolean;
    searchQuery?: string;
}
