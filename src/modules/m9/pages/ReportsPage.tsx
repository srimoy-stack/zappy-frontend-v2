import React from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    TrendingUp,
    ShoppingBag,
    Percent,
    DollarSign,
    Clock,
    Banknote,
    ArrowRight,
    Trophy,
    History
} from 'lucide-react';
import { ReportConfig } from '../types/reports';
import { mockItems } from '../mock/items';
import { mockPayments } from '../mock/finances';
import { formatCurrency, cn } from '@/utils';
import { useRouteAccess } from '@/shared/hooks/useRouteAccess';
import { UserType } from '@/shared/types/auth';

const REPORTS: (ReportConfig & { icon: any })[] = [
    {
        id: 'DAILY_SALES',
        title: 'Daily Sales Report',
        description: 'View aggregated sales data by store for a specific date range.',
        path: '/backoffice/reports/daily-sales',
        icon: TrendingUp
    },
    {
        id: 'SALES_BY_CHANNEL',
        title: 'Sales by Channel',
        description: 'Analyze performance across POS, Online, and Uber Eats.',
        path: '/backoffice/reports/sales-by-channel',
        icon: ShoppingBag
    },
    {
        id: 'TOP_SELLING_ITEMS',
        title: 'Top Selling Items',
        description: 'Identification of best performers by quantity and revenue.',
        path: '/backoffice/reports/top-selling-items',
        icon: FileText
    },
    {
        id: 'DISCOUNTS',
        title: 'Discounts & Offers',
        description: 'Track promotional efficiency and discount usage.',
        path: '/backoffice/reports/discounts',
        icon: Percent
    },
    {
        id: 'TAXES',
        title: 'Taxes Summary',
        description: 'Consolidated tax report for accounting reconciliation.',
        path: '/backoffice/reports/taxes',
        icon: DollarSign
    },
    {
        id: 'PREP_TIME',
        title: 'Preparation Time',
        description: 'Kitchen performance metrics and delivery speed.',
        path: '/backoffice/reports/prep-time',
        icon: Clock
    },
    {
        id: 'CASH_VARIANCE',
        title: 'Cash Variance',
        description: 'Audit report for cash drawer discrepancies.',
        path: '/backoffice/cash-variance',
        icon: Banknote
    }
];

export const ReportsPage: React.FC = () => {
    const router = useRouter();
    const { isSuperAdmin, userType } = useRouteAccess();

    const isAdmin = isSuperAdmin || userType === UserType.BRAND_ADMIN || userType === UserType.ADMIN;

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20 px-4">
            {/* Header */}
            <div className="border-b border-slate-200 pb-4 pt-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-lg shadow-lg">
                        <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports</h1>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5 opacity-80">
                            Business Intelligence & Exports
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Intelligence Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Widget */}
                <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100/50 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-24 h-24 text-emerald-600" />
                    </div>

                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Trophy className="w-4 h-4 text-emerald-700" />
                            </div>
                            <h3 className="text-sm font-black text-emerald-900 uppercase tracking-wide">Top Selling Items</h3>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">This Week</span>
                    </div>

                    <div className="space-y-3 relative z-10">
                        {mockItems.slice(0, 3).map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-100/50 hover:shadow-md hover:scale-[1.02] transition-all">
                                <div className="font-black text-lg text-emerald-200 w-6">0{idx + 1}</div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-800">{item.name}</p>
                                    <p className="text-[10px] text-slate-500">{item.categoryId === 'cat-1' ? 'Signature Pizza' : 'Category ' + item.categoryId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-900">{Math.floor(Math.random() * 50) + 120} Sold</p>
                                    <p className="text-[10px] font-bold text-emerald-600">{formatCurrency((item.variantGroups?.[0]?.variants?.[0]?.basePrice || 10) * 120)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Latest Activity Widget */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100/50 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <History className="w-24 h-24 text-blue-600" />
                    </div>

                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <History className="w-4 h-4 text-blue-700" />
                            </div>
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-wide">Latest Activity</h3>
                        </div>
                        <button className="text-[10px] font-bold text-blue-600 hover:underline">View Ledger</button>
                    </div>

                    <div className="space-y-3 relative z-10">
                        {mockPayments.slice(0, 3).map((payment) => (
                            <div key={payment.id} className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100/50 hover:shadow-md hover:scale-[1.02] transition-all">
                                <div className={cn(
                                    "w-1.5 h-8 rounded-full",
                                    payment.status === 'Paid' ? "bg-emerald-400" : payment.status === 'Pending' ? "bg-amber-400" : "bg-rose-400"
                                )} />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-800">{payment.orderNumber}</p>
                                    <p className="text-[10px] text-slate-500">{payment.date.split(' ')[0]}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-900">{formatCurrency(payment.grossAmount)}</p>
                                    <p className={cn(
                                        "text-[9px] font-black uppercase tracking-wider",
                                        payment.status === 'Paid' ? "text-emerald-500" : payment.status === 'Pending' ? "text-amber-500" : "text-rose-500"
                                    )}>{payment.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {REPORTS.filter(r => isAdmin || (r.id !== 'TAXES' && r.id !== 'CASH_VARIANCE')).map((report) => (
                    <div
                        key={report.id}
                        className="group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex flex-col justify-between"
                        onClick={() => router.push(report.path)}
                    >
                        <div className="mb-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
                                <report.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-2 truncate" title={report.title}>
                                {report.title}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2" title={report.description}>
                                {report.description}
                            </p>
                        </div>

                        <div className="flex items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                            View Report
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
