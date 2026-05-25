'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/modules/pos/context/POSContext';
import {
    ArrowLeft,
    Search,
    Calendar as CalendarIcon,
    Filter,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Clock,
    User as UserIcon,
    ChevronRight,
    Printer,
    Mail,
    Phone,
    CreditCard,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Truck,
    Utensils,
    Package,
    ChevronLeft,
    X
} from 'lucide-react';
import '../styles/pos-rush.css';

// Mock Cashier-specific orders with extensive data
const mockCashierOrders = [
    {
        id: 'ORD-8821',
        orderNumber: '#8821',
        date: '2026-05-19',
        time: '06:15 PM',
        placedAt: '2026-05-19 06:15 PM',
        completedAt: '2026-05-19 06:30 PM',
        cashierId: 'U002', // Sarah Store Staff
        cashierName: 'Sarah Store Staff',
        customer: {
            name: 'Jessica Pearson',
            phone: '+1 (555) 012-3456',
            email: 'jessica@pearsonhardman.com',
            tier: 'VIP',
            loyaltyPoints: 1250
        },
        fulfillment: {
            type: 'Delivery',
            provider: 'Uber Eats',
            address: '601 5th Ave, New York, NY 10017',
            deliveryFee: 5.99
        },
        items: [
            {
                name: 'Margherita Pizza',
                quantity: 2,
                basePrice: 12.99,
                variants: [{ name: 'Size', value: 'Medium 10"', price: 3.50 }],
                modifiers: [{ name: 'Extra Cheese', price: 1.50, quantity: 1 }],
                itemTotal: 35.98
            },
            {
                name: 'French Fries',
                quantity: 1,
                basePrice: 3.99,
                variants: [],
                modifiers: [],
                itemTotal: 3.99
            },
            {
                name: 'Coca Cola',
                quantity: 2,
                basePrice: 2.50,
                variants: [],
                modifiers: [],
                itemTotal: 5.00
            }
        ],
        pricing: {
            subtotal: 44.97,
            discount: 4.50,
            deliveryFee: 5.99,
            tax: 4.65,
            tip: 5.00,
            total: 56.11
        },
        payment: {
            method: 'CARD',
            brand: 'Visa',
            last4: '4242',
            transactionId: 'TXN-U8821A',
            paidAt: '2026-05-19 06:15 PM'
        },
        status: 'COMPLETED',
        timeline: [
            { time: '06:15 PM', label: 'Order Registered by Cashier' },
            { time: '06:18 PM', label: 'Kitchen Preparation Started' },
            { time: '06:28 PM', label: 'Dispatched with Uber Eats' },
            { time: '06:30 PM', label: 'Delivered & Settled' }
        ]
    },
    {
        id: 'ORD-8819',
        orderNumber: '#8819',
        date: '2026-05-19',
        time: '05:40 PM',
        placedAt: '2026-05-19 05:40 PM',
        completedAt: '2026-05-19 05:55 PM',
        cashierId: 'U002',
        cashierName: 'Sarah Store Staff',
        customer: {
            name: 'Harvey Specter',
            phone: '+1 (555) 987-6543',
            email: 'harvey@specter.com',
            tier: 'VIP',
            loyaltyPoints: 850
        },
        fulfillment: {
            type: 'Dine-In',
            tableId: 'T2',
            tableName: 'Table 2'
        },
        items: [
            {
                name: 'Pepperoni Feast',
                quantity: 1,
                basePrice: 14.99,
                variants: [{ name: 'Portion Type', value: 'Full (4 Slices)', price: 5.50 }],
                modifiers: [{ name: 'Jalapenos', price: 1.00, quantity: 1 }],
                itemTotal: 21.49
            },
            {
                name: 'Chocolate Cake',
                quantity: 1,
                basePrice: 5.99,
                variants: [],
                modifiers: [],
                itemTotal: 5.99
            }
        ],
        pricing: {
            subtotal: 27.48,
            discount: 0.00,
            deliveryFee: 0.00,
            tax: 2.75,
            tip: 4.00,
            total: 34.23
        },
        payment: {
            method: 'CARD',
            brand: 'Mastercard',
            last4: '8811',
            transactionId: 'TXN-H8819X',
            paidAt: '2026-05-19 05:40 PM'
        },
        status: 'COMPLETED',
        timeline: [
            { time: '05:40 PM', label: 'Order Registered' },
            { time: '05:42 PM', label: 'Kitchen Fire' },
            { time: '05:52 PM', label: 'Ready for Service' },
            { time: '05:55 PM', label: 'Served on Table 2' }
        ]
    },
    {
        id: 'ORD-8815',
        orderNumber: '#8815',
        date: '2026-05-19',
        time: '04:10 PM',
        placedAt: '2026-05-19 04:10 PM',
        completedAt: null,
        cashierId: 'U002',
        cashierName: 'Sarah Store Staff',
        customer: {
            name: 'Mike Ross',
            phone: '+1 (444) 123-4567',
            email: 'mross@psls.com',
            tier: 'Member',
            loyaltyPoints: 300
        },
        fulfillment: {
            type: 'Pickup'
        },
        items: [
            {
                name: 'Veggie Supreme Pizza',
                quantity: 1,
                basePrice: 13.99,
                variants: [{ name: 'Size', value: 'Regular 8"', price: 0.00 }],
                modifiers: [],
                itemTotal: 13.99
            }
        ],
        pricing: {
            subtotal: 13.99,
            discount: 1.40,
            deliveryFee: 0.00,
            tax: 1.26,
            tip: 0.00,
            total: 13.85
        },
        payment: {
            method: 'CASH',
            transactionId: 'CASH-REG01',
            paidAt: '2026-05-19 04:10 PM'
        },
        status: 'PREPARING',
        timeline: [
            { time: '04:10 PM', label: 'Order Registered' },
            { time: '04:12 PM', label: 'Sent to Pizza Station' }
        ]
    },
    {
        id: 'ORD-8802',
        orderNumber: '#8802',
        date: '2026-05-18',
        time: '08:15 PM',
        placedAt: '2026-05-18 08:15 PM',
        completedAt: null,
        cashierId: 'U002',
        cashierName: 'Sarah Store Staff',
        customer: {
            name: 'Walk-In Customer',
            phone: 'N/A',
            email: '',
            tier: 'Guest',
            loyaltyPoints: 0
        },
        fulfillment: {
            type: 'Pickup'
        },
        items: [
            {
                name: 'Margherita Pizza',
                quantity: 1,
                basePrice: 12.99,
                variants: [],
                modifiers: [],
                itemTotal: 12.99
            }
        ],
        pricing: {
            subtotal: 12.99,
            discount: 0.00,
            deliveryFee: 0.00,
            tax: 1.30,
            tip: 0.00,
            total: 14.29
        },
        payment: {
            method: 'CASH',
            transactionId: 'CASH-REG01',
            paidAt: '2026-05-18 08:15 PM'
        },
        status: 'CANCELLED',
        timeline: [
            { time: '08:15 PM', label: 'Order Registered' },
            { time: '08:20 PM', label: 'Voided by Store Manager' }
        ]
    },
    {
        id: 'ORD-8795',
        orderNumber: '#8795',
        date: '2026-05-18',
        time: '02:30 PM',
        placedAt: '2026-05-18 02:30 PM',
        completedAt: '2026-05-18 02:45 PM',
        cashierId: 'U002',
        cashierName: 'Sarah Store Staff',
        customer: {
            name: 'Rachel Zane',
            phone: '+1 (555) 444-5555',
            email: 'rachel@randg.com',
            tier: 'Member',
            loyaltyPoints: 450
        },
        fulfillment: {
            type: 'Pickup'
        },
        items: [
            {
                name: 'Pizza Duo Combo',
                quantity: 1,
                basePrice: 24.99,
                variants: [],
                modifiers: [],
                itemTotal: 24.99
            }
        ],
        pricing: {
            subtotal: 24.99,
            discount: 2.50,
            deliveryFee: 0.00,
            tax: 2.25,
            tip: 3.00,
            total: 27.74
        },
        payment: {
            method: 'CARD',
            brand: 'Amex',
            last4: '1007',
            transactionId: 'TXN-A8795L',
            paidAt: '2026-05-18 02:30 PM'
        },
        status: 'COMPLETED',
        timeline: [
            { time: '02:30 PM', label: 'Order Registered' },
            { time: '02:32 PM', label: 'Kitchen Preparation' },
            { time: '02:42 PM', label: 'Ready for Pickup' },
            { time: '02:45 PM', label: 'Completed' }
        ]
    },
    {
        id: 'ORD-8788',
        orderNumber: '#8788',
        date: '2026-05-17',
        time: '07:10 PM',
        placedAt: '2026-05-17 07:10 PM',
        completedAt: '2026-05-17 07:35 PM',
        cashierId: 'U002',
        cashierName: 'Sarah Store Staff',
        customer: {
            name: 'Louis Litt',
            phone: '+1 (555) 777-8888',
            email: 'louis@littbrand.com',
            tier: 'VIP',
            loyaltyPoints: 920
        },
        fulfillment: {
            type: 'Delivery',
            provider: 'DoorDash',
            address: '500 Madison Ave, New York, NY 10022',
            deliveryFee: 4.99
        },
        items: [
            {
                name: 'Truffle Pizza',
                quantity: 1,
                basePrice: 18.99,
                variants: [],
                modifiers: [{ name: 'Mushrooms', price: 1.20, quantity: 1 }],
                itemTotal: 20.19
            },
            {
                name: 'Mozzarella Sticks',
                quantity: 1,
                basePrice: 6.99,
                variants: [],
                modifiers: [],
                itemTotal: 6.99
            }
        ],
        pricing: {
            subtotal: 27.18,
            discount: 0.00,
            deliveryFee: 4.99,
            tax: 3.22,
            tip: 6.00,
            total: 41.39
        },
        payment: {
            method: 'CARD',
            brand: 'Visa',
            last4: '0909',
            transactionId: 'TXN-V8788M',
            paidAt: '2026-05-17 07:10 PM'
        },
        status: 'REFUNDED',
        timeline: [
            { time: '07:10 PM', label: 'Order Registered' },
            { time: '07:32 PM', label: 'Completed' },
            { time: '08:00 PM', label: 'Refunded due to wrong items' }
        ]
    }
];

export const CashierOrdersPage: React.FC = () => {
    const router = useRouter();
    const { session } = usePOS();
    const calendarRef = useRef<HTMLDivElement>(null);

    // Get current logged-in cashier info
    const cashierName = session?.user?.name || 'Sarah Store Staff';
    const cashierId = session?.user?.id || 'U002';

    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>('ORD-8821');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('ALL');

    // Calendar States
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD format
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(4); // May (0-indexed)
    const [currentYear, setCurrentYear] = useState(2026);

    // Close calendar on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calendar Month Navigation
    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    // Calculate days grid
    const calendarDays = useMemo(() => {
        const days = [];
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const numDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Previous month padding
        const prevMonthNumDays = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push({
                day: prevMonthNumDays - i,
                isCurrentMonth: false,
                dateStr: `${currentMonth === 0 ? currentYear - 1 : currentYear}-${String(currentMonth === 0 ? 12 : currentMonth).padStart(2, '0')}-${String(prevMonthNumDays - i).padStart(2, '0')}`
            });
        }

        // Current month days
        for (let i = 1; i <= numDaysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
            });
        }

        // Next month padding to fill grid to multiple of 7
        const totalGridSlots = 42; // 6 rows
        const nextMonthPadding = totalGridSlots - days.length;
        for (let i = 1; i <= nextMonthPadding; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                dateStr: `${currentMonth === 11 ? currentYear + 1 : currentYear}-${String(currentMonth === 11 ? 1 : currentMonth + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
            });
        }

        return days;
    }, [currentMonth, currentYear]);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Filter logic
    const filteredOrders = useMemo(() => {
        return mockCashierOrders.filter(order => {
            // Search query match
            const matchesSearch =
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.phone.includes(searchQuery);

            // Status match
            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

            // Fulfillment match
            const matchesFulfillment =
                fulfillmentFilter === 'ALL' ||
                order.fulfillment.type.toUpperCase() === fulfillmentFilter.toUpperCase();

            // Calendar date match
            const matchesDate = !selectedDate || order.date === selectedDate;

            return matchesSearch && matchesStatus && matchesFulfillment && matchesDate;
        });
    }, [searchQuery, statusFilter, fulfillmentFilter, selectedDate]);

    const selectedOrder = useMemo(() => {
        return mockCashierOrders.find(o => o.id === selectedOrderId) || mockCashierOrders[0];
    }, [selectedOrderId]);

    // Analytical Metrics for filtered list
    const metrics = useMemo(() => {
        const completed = filteredOrders.filter(o => o.status === 'COMPLETED');
        const sales = completed.reduce((sum, o) => sum + o.pricing.total, 0);
        const count = filteredOrders.length;
        const avgTicket = count > 0 ? sales / count : 0;
        return {
            sales,
            count,
            avgTicket
        };
    }, [filteredOrders]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { bg: '#E6F4EA', text: '#137333', border: '#CEEAD6' };
            case 'PREPARING':
                return { bg: '#FEF7E0', text: '#B06000', border: '#FEEFC3' };
            case 'CANCELLED':
                return { bg: '#FCE8E6', text: '#C5221F', border: '#FAD2CF' };
            case 'REFUNDED':
                return { bg: '#F3E8FF', text: '#6B21A8', border: '#E9D5FF' };
            default:
                return { bg: '#E8F0FE', text: '#1A73E8', border: '#D2E3FC' };
        }
    };

    return (
        <div className="pos-screen" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <style>{`
                .cashier-layout {
                    display: flex;
                    flex: 1;
                    height: 100vh;
                    background: #F8FAFC;
                    color: #0F172A;
                    overflow: hidden;
                    font-family: Inter, sans-serif;
                }
                .orders-list-panel {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid #E2E8F0;
                    overflow: hidden;
                    background: #F8FAFC;
                }
                .panel-header {
                    padding: 24px;
                    background: white;
                    border-bottom: 1px solid #E2E8F0;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .metrics-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    padding: 0 24px 20px;
                    background: white;
                    border-bottom: 1px solid #E2E8F0;
                }
                .metric-card {
                    background: #F1F5F9;
                    padding: 16px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .metric-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .metric-value {
                    font-size: 20px;
                    font-weight: 900;
                    color: #0F172A;
                }
                .filter-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 24px;
                    background: white;
                    border-bottom: 1px solid #E2E8F0;
                    flex-wrap: wrap;
                    position: relative;
                }
                .filter-select {
                    height: 40px;
                    padding: 0 12px;
                    border-radius: 8px;
                    border: 1px solid #CBD5E1;
                    background: white;
                    font-weight: 600;
                    font-size: 13px;
                    color: #334155;
                    outline: none;
                    cursor: pointer;
                }
                .calendar-trigger-btn {
                    height: 40px;
                    padding: 0 16px;
                    border-radius: 8px;
                    border: 1px solid #CBD5E1;
                    background: white;
                    font-weight: 600;
                    font-size: 13px;
                    color: #334155;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .calendar-trigger-btn.active {
                    background: #E6F4EA;
                    color: #137333;
                    border-color: #CEEAD6;
                }
                .calendar-popover {
                    position: absolute;
                    top: 60px;
                    left: 24px;
                    background: white;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    width: 320px;
                    z-index: 100;
                    padding: 16px;
                }
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                    text-align: center;
                }
                .calendar-day-header {
                    font-size: 11px;
                    font-weight: 800;
                    color: #64748B;
                    padding: 8px 0;
                    text-transform: uppercase;
                }
                .calendar-day-btn {
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    color: #0F172A;
                }
                .calendar-day-btn:hover {
                    background: #F1F5F9;
                }
                .calendar-day-btn.selected {
                    background: #1FA4A9;
                    color: white;
                    font-weight: 800;
                }
                .calendar-day-btn.muted {
                    color: #94A3B8;
                }
                .orders-scroll-area {
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto;
                }
                .order-list-item {
                    background: white;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.2s;
                }
                .order-list-item:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border-color: #1FA4A9;
                }
                .order-list-item.active {
                    background: #F0FDFA;
                    border-color: #1FA4A9;
                    box-shadow: 0 4px 12px rgba(31, 164, 169, 0.08);
                }
                .order-detail-panel {
                    width: 460px;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    border-left: 1px solid #E2E8F0;
                    overflow: hidden;
                    height: 100%;
                }
                .detail-header {
                    padding: 24px;
                    border-bottom: 1px solid #E2E8F0;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    background: #F8FAFC;
                }
                .detail-body {
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .section-title {
                    font-size: 11px;
                    font-weight: 800;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 12px;
                }
                .customer-info-box {
                    padding: 16px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px dashed #E2E8F0;
                }
                .price-breakdown {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 16px;
                    background: #F8FAFC;
                    border-radius: 12px;
                }
                .timeline-step {
                    display: flex;
                    gap: 16px;
                    position: relative;
                    padding-bottom: 20px;
                }
                .timeline-step::before {
                    content: '';
                    position: absolute;
                    left: 9px;
                    top: 18px;
                    bottom: 0;
                    width: 2px;
                    background: #E2E8F0;
                }
                .timeline-step:last-child::before {
                    display: none;
                }
                .step-dot {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #10B981;
                    border: 4px solid white;
                    box-shadow: 0 0 0 1px #10B981;
                    z-index: 1;
                    margin-top: 2px;
                }
                .detail-footer {
                    padding: 24px;
                    border-top: 1px solid #E2E8F0;
                    background: #F8FAFC;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
            `}</style>

            <div className="cashier-layout">
                {/* 1. LEFT PANEL: LIST OF ORDERS */}
                <div className="orders-list-panel">
                    {/* Header */}
                    <div className="panel-header">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <button
                                    onClick={() => router.push('/pos/menu')}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h1 style={{ fontSize: '22px', fontWeight: 900, margin: 0 }}>Cashier Order Vault</h1>
                                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                                        Logged in: <strong>{cashierName}</strong> (Station #{cashierId})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div style={{ position: 'relative', width: '100%' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                            <input
                                type="text"
                                placeholder="Search by Order ID, customer, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '46px',
                                    paddingLeft: '48px',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    outline: 'none',
                                    background: 'white'
                                }}
                            />
                        </div>
                    </div>

                    {/* Metrics widgets */}
                    <div className="metrics-row">
                        <div className="metric-card">
                            <TrendingUp size={24} color="#1FA4A9" />
                            <div>
                                <div className="metric-label">Gross Sales</div>
                                <div className="metric-value">${metrics.sales.toFixed(2)}</div>
                            </div>
                        </div>
                        <div className="metric-card">
                            <ShoppingBag size={24} color="#6366F1" />
                            <div>
                                <div className="metric-label">Total Tickets</div>
                                <div className="metric-value">{metrics.count} Orders</div>
                            </div>
                        </div>
                        <div className="metric-card">
                            <DollarSign size={24} color="#10B981" />
                            <div>
                                <div className="metric-label">Avg Ticket Size</div>
                                <div className="metric-value">${metrics.avgTicket.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters bar */}
                    <div className="filter-bar">
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Filter size={16} color="#64748B" />
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748B' }}>FILTERS:</span>
                        </div>

                        {/* Calendar Custom Date Picker Trigger */}
                        <button
                            className={`calendar-trigger-btn ${selectedDate ? 'active' : ''}`}
                            onClick={() => setShowCalendar(!showCalendar)}
                        >
                            <CalendarIcon size={16} />
                            <span>
                                {selectedDate ? `Date: ${selectedDate}` : 'Filter by Calendar Date'}
                            </span>
                            {selectedDate && (
                                <X
                                    size={14}
                                    style={{ marginLeft: '4px', cursor: 'pointer' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDate(null);
                                    }}
                                />
                            )}
                        </button>

                        {/* Interactive Calendar Popover */}
                        {showCalendar && (
                            <div className="calendar-popover" ref={calendarRef}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <button
                                        onClick={handlePrevMonth}
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span style={{ fontSize: '14px', fontWeight: 800 }}>
                                        {monthNames[currentMonth]} {currentYear}
                                    </span>
                                    <button
                                        onClick={handleNextMonth}
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                <div className="calendar-grid">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                                        <div key={i} className="calendar-day-header">{d}</div>
                                    ))}
                                    {calendarDays.map((d, i) => (
                                        <button
                                            key={i}
                                            className={`calendar-day-btn ${!d.isCurrentMonth ? 'muted' : ''} ${selectedDate === d.dateStr ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedDate(d.dateStr);
                                                setShowCalendar(false);
                                            }}
                                        >
                                            {d.day}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                                    <button
                                        onClick={() => {
                                            setSelectedDate('2026-05-19'); // Fast shortcut to Today in mock data
                                            setShowCalendar(false);
                                        }}
                                        style={{ border: 'none', background: 'transparent', color: '#1FA4A9', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                                    >
                                        Go to Today
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedDate(null);
                                            setShowCalendar(false);
                                        }}
                                        style={{ border: 'none', background: 'transparent', color: '#64748B', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                                    >
                                        Clear Filter
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Status filter */}
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PREPARING">Preparing</option>
                            <option value="REFUNDED">Refunded</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>

                        {/* Fulfillment Filter */}
                        <select
                            className="filter-select"
                            value={fulfillmentFilter}
                            onChange={(e) => setFulfillmentFilter(e.target.value)}
                        >
                            <option value="ALL">All Fulfillments</option>
                            <option value="DINE-IN">Dine-In</option>
                            <option value="PICKUP">Pickup</option>
                            <option value="DELIVERY">Delivery</option>
                        </select>
                    </div>

                    {/* Orders list scrollable */}
                    <div className="orders-scroll-area pos-scroll">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => {
                                const stColors = getStatusColor(order.status);
                                return (
                                    <div
                                        key={order.id}
                                        className={`order-list-item ${selectedOrderId === order.id ? 'active' : ''}`}
                                        onClick={() => setSelectedOrderId(order.id)}
                                    >
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '10px',
                                                background: order.fulfillment.type === 'Delivery' ? '#FEF3C7' : order.fulfillment.type === 'Dine-In' ? '#D1FAE5' : '#E0F2FE',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: order.fulfillment.type === 'Delivery' ? '#D97706' : order.fulfillment.type === 'Dine-In' ? '#059669' : '#0284C7'
                                            }}>
                                                {order.fulfillment.type === 'Delivery' ? <Truck size={20} /> : order.fulfillment.type === 'Dine-In' ? <Utensils size={20} /> : <ShoppingBag size={20} />}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '15px', fontWeight: 800 }}>{order.id}</span>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '10px',
                                                        fontWeight: 800,
                                                        background: stColors.bg,
                                                        color: stColors.text,
                                                        border: `1px solid ${stColors.border}`
                                                    }}>{order.status}</span>
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>
                                                    {order.placedAt} • {order.customer.name}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>
                                                    ${order.pricing.total.toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                                                    {order.items.reduce((s, i) => s + i.quantity, 0)} items
                                                </div>
                                            </div>
                                            <ChevronRight size={18} color="#94A3B8" />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                                <ShoppingBag size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                                    No Cashier Orders Found
                                </h3>
                                <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                                    Try adjusting your filters or calendar selection.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. RIGHT PANEL: DETAILED VIEW */}
                <div className="order-detail-panel">
                    {selectedOrder ? (
                        <>
                            <div className="detail-header">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#1FA4A9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Transaction Details
                                        </span>
                                        <h2 style={{ fontSize: '28px', fontWeight: 950, margin: '4px 0 0' }}>
                                            {selectedOrder.id}
                                        </h2>
                                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                                            Placed on {selectedOrder.placedAt}
                                        </span>
                                    </div>
                                    <div style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        background: getStatusColor(selectedOrder.status).bg,
                                        color: getStatusColor(selectedOrder.status).text,
                                        border: `1px solid ${getStatusColor(selectedOrder.status).border}`
                                    }}>
                                        {selectedOrder.status}
                                    </div>
                                </div>
                            </div>

                            <div className="detail-body pos-scroll">
                                {/* Customer Info */}
                                <div>
                                    <div className="section-title">Customer Information</div>
                                    <div className="customer-info-box">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 800, fontSize: '15px' }}>{selectedOrder.customer.name}</span>
                                            <span style={{
                                                background: '#FEF3C7',
                                                color: '#D97706',
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                padding: '2px 8px',
                                                borderRadius: '6px'
                                            }}>{selectedOrder.customer.tier}</span>
                                        </div>
                                        {selectedOrder.customer.phone !== 'N/A' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                                                <Phone size={14} />
                                                <span>{selectedOrder.customer.phone}</span>
                                            </div>
                                        )}
                                        {selectedOrder.customer.email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                                                <Mail size={14} />
                                                <span>{selectedOrder.customer.email}</span>
                                            </div>
                                        )}
                                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: '4px' }}>
                                            Loyalty Wallet Balance: <strong>{selectedOrder.customer.loyaltyPoints} Points</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Fulfillment info */}
                                <div>
                                    <div className="section-title">Fulfillment Log</div>
                                    <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '14px' }}>Mode: {selectedOrder.fulfillment.type}</span>
                                        </div>
                                        {selectedOrder.fulfillment.type === 'Delivery' && (
                                            <>
                                                <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600, marginBottom: '6px' }}>
                                                    Courier Service: <strong>{selectedOrder.fulfillment.provider}</strong>
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                                                    Destination: <strong>{selectedOrder.fulfillment.address}</strong>
                                                </div>
                                            </>
                                        )}
                                        {selectedOrder.fulfillment.type === 'Dine-In' && (
                                            <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                                                Assigned Seat: <strong>{selectedOrder.fulfillment.tableName}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Items List */}
                                <div>
                                    <div className="section-title">Itemized Receipt</div>
                                    <div>
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="item-row">
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '14px' }}>
                                                        {item.quantity}x {item.name}
                                                    </div>
                                                    {item.variants.map((v, i) => (
                                                        <div key={i} style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                                                            • {v.name}: {v.value}
                                                        </div>
                                                    ))}
                                                    {item.modifiers.map((m, i) => (
                                                        <div key={i} style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                                                            • {m.name} x{m.quantity}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span style={{ fontWeight: 800, fontSize: '14px' }}>
                                                    ${item.itemTotal.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Financial Ledger */}
                                <div>
                                    <div className="section-title">Financial Ledger</div>
                                    <div className="price-breakdown">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                            <span>Subtotal</span>
                                            <span>${selectedOrder.pricing.subtotal.toFixed(2)}</span>
                                        </div>
                                        {selectedOrder.pricing.discount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>
                                                <span>Promo Discount</span>
                                                <span>-${selectedOrder.pricing.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {selectedOrder.pricing.deliveryFee > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                                <span>Delivery surcharge</span>
                                                <span>${selectedOrder.pricing.deliveryFee.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                            <span>Taxes (10%)</span>
                                            <span>${selectedOrder.pricing.tax.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                            <span>Staff Gratuity</span>
                                            <span>${selectedOrder.pricing.tip.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, borderTop: '2px dashed #CBD5E1', paddingTop: '12px', marginTop: '4px' }}>
                                            <span>NET TOTAL</span>
                                            <span style={{ color: '#10B981' }}>${selectedOrder.pricing.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Log */}
                                <div>
                                    <div className="section-title">Payment Ledger</div>
                                    <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <CreditCard size={20} color="#64748B" />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: '13px' }}>
                                                {selectedOrder.payment.method} {selectedOrder.payment.brand && `• ${selectedOrder.payment.brand} (*${selectedOrder.payment.last4})`}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                                                Transaction Key: {selectedOrder.payment.transactionId}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Lifecycle Timeline */}
                                <div>
                                    <div className="section-title">Lifecycle Logs</div>
                                    <div>
                                        {selectedOrder.timeline.map((step, idx) => (
                                            <div key={idx} className="timeline-step">
                                                <div className="step-dot" />
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 800 }}>{step.label}</div>
                                                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                                                        {selectedOrder.date} • {step.time}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="detail-footer">
                                <button
                                    onClick={() => alert(`Receipt printed successfully for ${selectedOrder.id}`)}
                                    style={{
                                        height: '46px',
                                        borderRadius: '8px',
                                        background: 'white',
                                        border: '1px solid #CBD5E1',
                                        color: '#334155',
                                        fontWeight: 800,
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Printer size={16} /> Print Receipt
                                </button>
                                <button
                                    onClick={() => alert(`Lifecycle audit report saved to terminal log.`)}
                                    style={{
                                        height: '46px',
                                        borderRadius: '8px',
                                        background: '#334155',
                                        border: 'none',
                                        color: 'white',
                                        fontWeight: 800,
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Package size={16} /> Audit Lifecycle
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', padding: '40px', textAlign: 'center' }}>
                            <ShoppingBag size={80} style={{ opacity: 0.1, marginBottom: '24px' }} />
                            <h3 style={{ fontSize: '20px', fontWeight: 900 }}>Audit Engine</h3>
                            <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>
                                Select a cashier order from the transaction vault to perform audits.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
