import { CashVarianceRecord } from '../types/cash-variance';

export const mockCashVarianceData: CashVarianceRecord[] = [
    {
        id: 'VAR-001',
        date: new Date().toISOString().split('T')[0]!,
        userName: 'John Doe',
        userId: 'user-001',
        storeName: 'Downtown Store',
        storeId: 'store-01',
        openingCash: 500.00,
        closingCash: 1250.00,
        expectedCash: 1250.00,
        variance: 0.00,
        status: 'Balanced',
        currency: 'USD',
        shiftId: 'SHIFT-101',
        timestamp: new Date().toISOString(),
        paymentBreakdown: {
            cash: 750.00,
            card: 500.00,
            other: 0.00
        }
    },
    {
        id: 'VAR-002',
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]!,
        userName: 'Jane Smith',
        userId: 'user-002',
        storeName: 'Downtown Store',
        storeId: 'store-01',
        openingCash: 500.00,
        closingCash: 1100.00,
        expectedCash: 1120.00,
        variance: -20.00,
        status: 'Short',
        currency: 'USD',
        shiftId: 'SHIFT-102',
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        paymentBreakdown: {
            cash: 600.00,
            card: 450.00,
            other: 70.00
        }
    },
    {
        id: 'VAR-003',
        date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0]!,
        userName: 'Mike Wilson',
        userId: 'user-003',
        storeName: 'Westside Mall',
        storeId: 'store-02',
        openingCash: 300.00,
        closingCash: 955.50,
        expectedCash: 940.00,
        variance: 15.50,
        status: 'Over',
        currency: 'USD',
        shiftId: 'SHIFT-103',
        timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        paymentBreakdown: {
            cash: 640.00,
            card: 300.00,
            other: 15.50
        }
    }
];
