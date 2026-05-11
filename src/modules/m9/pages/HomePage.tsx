'use client';

import React, { useState, useEffect } from 'react';
import {
    KpiRow,
    SalesByChannelTable,
    RecentOrdersTable,
    SalesPerformanceCard,
    ChannelSplitChart,
    DashboardDateRangePicker
} from '../components/Dashboard';
import { DashboardData } from '../types/dashboard';
import { LayoutDashboard, RefreshCcw } from 'lucide-react';
import { cn } from '@/utils';

/**
 * HomePage Component (M9-T1)
 * Executive Summary Dashboard
 */
export const HomePage: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));

            const mockData: DashboardData = {
                kpis: {
                    grossSales: 12420.00,
                    netSales: 11160.00,
                    orders: 418,
                    averageOrderValue: 26.70,
                    refunds: 120.00,
                    cashVariance: -15.00,
                },
                salesByChannel: [
                    { channel: 'POS', orders: 220, sales: 6900.00, percentage: 56.0 },
                    { channel: 'Online', orders: 160, sales: 3900.00, percentage: 31.0 },
                    { channel: 'Uber', orders: 38, sales: 1620.00, percentage: 13.0 },
                ],
                recentOrders: [
                    { id: '1', time: '7:45 PM', orderNumber: '#10492', customer: '905-xxx-xxxx', channel: 'POS', status: 'completed', total: 34.20 },
                    { id: '2', time: '7:42 PM', orderNumber: '#10491', customer: 'Wade Warren', channel: 'Online', status: 'pending', total: 32.50 },
                    { id: '3', time: '7:38 PM', orderNumber: '#10490', customer: 'Esther Howard', channel: 'POS', status: 'completed', total: 12.00 },
                    { id: '4', time: '7:35 PM', orderNumber: '#10489', customer: '905-yyy-yyyy', channel: 'Uber', status: 'refunded', total: 54.20 },
                    { id: '5', time: '7:30 PM', orderNumber: '#10488', customer: 'Anonymous', channel: 'POS', status: 'completed', total: 8.50 },
                ],
            };
            setData(mockData);
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Simulate real-time updates every 10s
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-20 px-2 lg:px-4">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 pt-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-100">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Overview</h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Real-time performance metrics</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchData()}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-90"
                        title="Refresh Data"
                    >
                        <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    </button>
                    <DashboardDateRangePicker onRangeChange={(range) => console.log('Selected range:', range)} />
                </div>
            </div>

            {/* 1. KPI SUMMARY ROW */}
            <section className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                <KpiRow data={data?.kpis || null} isLoading={isLoading} />
            </section>

            {/* 2. SALES ANALYSIS BLOCK */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                {/* Trend Chart (Daily / Weekly) */}
                <div className="xl:col-span-3">
                    <SalesPerformanceCard />
                </div>

                {/* Channel Split Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full animate-in fade-in slide-in-from-right-4 duration-700">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Channel Split</h3>
                    <ChannelSplitChart data={data?.salesByChannel || []} isLoading={isLoading} />
                </div>
            </div>

            {/* 3. DETAILS BLOCKS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                {/* Sales by Channel Table */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Channel Breakdown
                        </h2>
                    </div>
                    <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SalesByChannelTable
                            data={data?.salesByChannel || []}
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Recent Transactional History
                        </h2>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">Live</span>
                    </div>
                    <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <RecentOrdersTable
                            data={data?.recentOrders || []}
                            isLoading={isLoading}
                            onOrderClick={(id) => console.log('Viewing order:', id)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
