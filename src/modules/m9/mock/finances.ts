import { PaymentRecord, RefundRecord, PayoutRecord } from '../types/finances';

export const mockPayments: PaymentRecord[] = [
    {
        id: 'PAY-001',
        date: '2024-02-02 10:15 AM',
        orderId: 'ORD-10492',
        orderNumber: '#10492',
        method: 'Card',
        status: 'Paid',
        grossAmount: 34.20,
        fee: 0.85,
        netAmount: 33.35,
        store: 'Main Branch'
    },
    {
        id: 'PAY-002',
        date: '2024-02-02 11:20 AM',
        orderId: 'ORD-10491',
        orderNumber: '#10491',
        method: 'Online',
        status: 'Pending',
        grossAmount: 32.50,
        fee: 1.20,
        netAmount: 31.30,
        store: 'Downtown Store'
    },
    {
        id: 'PAY-003',
        date: '2024-02-02 12:45 PM',
        orderId: 'ORD-10490',
        orderNumber: '#10490',
        method: 'Cash',
        status: 'Paid',
        grossAmount: 12.00,
        fee: 0.00,
        netAmount: 12.00,
        store: 'Main Branch'
    },
    {
        id: 'PAY-004',
        date: '2024-02-02 01:30 PM',
        orderId: 'ORD-10489',
        orderNumber: '#10489',
        method: 'Card',
        status: 'Failed',
        grossAmount: 54.20,
        fee: 0.00,
        netAmount: 54.20,
        store: 'Airport Outlet'
    },
    {
        id: 'PAY-005',
        date: '2024-02-01 06:15 PM',
        orderId: 'ORD-10488',
        orderNumber: '#10488',
        method: 'Wallet',
        status: 'Paid',
        grossAmount: 8.50,
        fee: 0.25,
        netAmount: 8.25,
        store: 'Main Branch'
    }
];

export const mockRefunds: RefundRecord[] = [
    {
        id: 'REF-001',
        date: '2024-02-02 02:45 PM',
        orderId: 'ORD-10489',
        orderNumber: '#10489',
        type: 'Full',
        amount: 54.20,
        reason: 'Payment error',
        approvedBy: 'Admin (Sarah)',
        store: 'Airport Outlet'
    },
    {
        id: 'REF-002',
        date: '2024-02-01 10:30 AM',
        orderId: 'ORD-10475',
        orderNumber: '#10475',
        type: 'Partial',
        amount: 15.00,
        reason: 'Order issue',
        approvedBy: 'Manager (John)',
        store: 'Main Branch'
    }
];

export const mockPayouts: PayoutRecord[] = [
    {
        id: 'PO-001',
        period: 'Jan 25 – Jan 31',
        gross: 12420.00,
        fees: 310.50,
        refunds: 450.00,
        netPaidOut: 11659.50,
        status: 'Paid'
    },
    {
        id: 'PO-002',
        period: 'Feb 1 – Feb 7',
        gross: 4500.00,
        fees: 112.50,
        refunds: 54.20,
        netPaidOut: 4333.30,
        status: 'Pending'
    }
];
